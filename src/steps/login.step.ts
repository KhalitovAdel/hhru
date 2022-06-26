import { By, until, WebDriver } from 'selenium-webdriver';

import config from '../config';
import { LoggerFactory } from '../logger';
import { TimeUtil } from '../utils';
import { CaptchaStep } from './captcha.step';

export class LoginStep {
    private readonly logger = LoggerFactory.getLogger(LoginStep.name);

    private readonly url: URL;

    constructor(
        private readonly driver: WebDriver,
        private readonly captchaStep: CaptchaStep,
        private readonly authData: Pick<typeof config['hh'], 'email' | 'password'>,
        host: string
    ) {
        this.url = new URL('account/login/', host);
    }

    public async login(): Promise<void> {
        try {
            await this.driver.get(this.url.href);

            if (await this.isLogin()) {
                this.logger.info('Already login');

                return;
            }

            await this.fillOtpForm();
            this.logger.info('Successfully login');
        } catch (error) {
            this.logger.error('Login error', { message: error instanceof Error ? error.message : undefined });
            throw error;
        }
    }

    private async isLogin(): Promise<boolean> {
        return await this.driver
            .wait(
                until.elementsLocated(By.css('input[data-qa="account-signup-email"]')),
                10 * TimeUtil.ONE_SECOND_IN_MILLISECOND
            )
            .then(
                () => false,
                () => true
            );
    }

    private async fillOtpForm(): Promise<void> {
        await this.driver.findElement(By.css('input[data-qa="account-signup-email"]')).sendKeys(this.authData.email);

        await this.driver.findElement(By.css('button[data-qa="expand-login-by-password"]')).click();
        await this.driver.wait(
            until.elementsLocated(By.css('input[data-qa="login-input-password"]')),
            10 * TimeUtil.ONE_SECOND_IN_MILLISECOND
        );

        await this.driver.findElement(By.css('input[data-qa="login-input-password"]')).sendKeys(this.authData.password);

        await this.driver.findElement(By.css('button[data-qa="account-login-submit"]')).click();

        if (await this.isCaptchaRequired()) {
            await this.captchaStep.exec(this.driver);
            await this.driver.findElement(By.css('button[data-qa="account-login-submit"]')).click();
        }

        await this.driver.wait(
            until.elementsLocated(By.css('button[data-qa="mainmenu_applicantProfile"]')),
            10 * TimeUtil.ONE_SECOND_IN_MILLISECOND
        );
    }

    private async isCaptchaRequired(): Promise<boolean> {
        return await this.driver
            .wait(
                until.elementLocated(By.css('div[data-qa="account-login-error"]')),
                10 * TimeUtil.ONE_SECOND_IN_MILLISECOND
            )
            .then(
                () => true,
                () => false
            );
    }
}
