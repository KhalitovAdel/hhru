import { Axios } from 'axios';
import { By, until, WebDriver } from 'selenium-webdriver';

import { LoggerFactory } from '../logger';
import { TimeUtil } from '../utils';

export class Client {
    private readonly logger = LoggerFactory.getLogger(Client.name);

    constructor(private readonly http: Axios, private readonly key: string) {}

    public async solveCaptchaV2(obj: { key: string; url: string }): Promise<string> {
        const token = await this.getCaptchaToken(obj);

        return this.getResult(token);
    }

    private async getCaptchaToken(obj: { key: string; url: string }): Promise<string> {
        const response = await this.http
            .request<string>({
                method: 'POST',
                url: `http://rucaptcha.com/in.php`,
                params: {
                    key: this.key,
                    method: 'userrecaptcha',
                    googlekey: obj.key,
                    pageurl: obj.url,
                    json: 1,
                },
            })
            .then((r) => JSON.parse(r.data) as { status: 1 | 0; request?: string });

        if (response.status !== 1 || !response.request) {
            const error = new Error('Invalid response');
            this.logger.error('Invalid response', { response, error });
            throw error;
        }

        return response.request;
    }

    private async getResult(token: string): Promise<string> {
        const { request } = await this.http
            .request<string>({
                method: 'GET',
                url: 'http://rucaptcha.com/res.php',
                params: {
                    key: this.key,
                    action: 'get',
                    id: token,
                    json: 1,
                },
            })
            .then((r) => JSON.parse(r.data) as { status: 1 | 0; request: string });
        if (request === 'CAPCHA_NOT_READY') {
            await new Promise((res) => setTimeout(res, 5000));
            return this.getResult(token);
        }

        return request;
    }
}

export class CaptchaStep {
    private readonly logger = LoggerFactory.getLogger(CaptchaStep.name);

    constructor(private readonly client: Client) {}

    public async exec(driver: WebDriver): Promise<void> {
        this.logger.info('Captcha processing started');
        try {
            if (!(await CaptchaStep.isCaptchaDetected(driver))) {
                this.logger.info('Captcha not detected');

                return;
            }

            const captchaResult = await this.client.solveCaptchaV2(await this.getKey(driver));
            await driver.executeScript(
                `document.querySelector("textarea#g-recaptcha-response").value = "${captchaResult}"`
            );

            this.logger.info('Captcha successfully solved');
        } catch (error) {
            this.logger.error('Captcha solving error', { error });
            throw error;
        }
    }

    private async getKey(driver: WebDriver): Promise<{ key: string; url: string }> {
        const captchaHref = await driver
            .findElement(By.css('iframe[title="reCAPTCHA"]'))
            .getAttribute('src')
            .then((h) => new URL(h));

        const key = captchaHref.searchParams.get('k');
        if (!key) throw new Error('Captcha key not found');

        return { key, url: await driver.getCurrentUrl() };
    }

    private static async isCaptchaDetected(driver: WebDriver): Promise<boolean> {
        return driver
            .wait(until.elementLocated(By.css('iframe[title="reCAPTCHA"]')), 15 * TimeUtil.ONE_SECOND_IN_MILLISECOND)
            .then(
                () => true,
                () => false
            );
    }
}
