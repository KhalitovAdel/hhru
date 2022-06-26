import { Axios } from 'axios';
import { Browser, Builder, WebDriver } from 'selenium-webdriver';

import config from '../../src/config';
import { CaptchaStep, Client, LoginStep } from '../../src/steps';

describe('LoginStep', () => {
    let driver: WebDriver;
    let loginStep: LoginStep;
    jest.setTimeout(1000 * 60 * 2);

    beforeAll((done) => {
        new Builder()
            .usingServer(config.browser.url)
            .forBrowser(Browser.FIREFOX)
            .build()
            .then((d) => {
                driver = d;

                loginStep = new LoginStep(
                    driver,
                    new CaptchaStep(new Client(new Axios({}), config.captcha.key)),
                    config.hh,
                    config.hh.webHost
                );
                done();
            }, done.fail);
    });

    afterAll(async () => driver.close());

    it('Should login', async () => {
        await loginStep.login();

        expect(true).toBeTruthy();
    });
});
