import { Axios } from 'axios';
import { Browser, Builder, WebDriver } from 'selenium-webdriver';

import config from './config';
import { LoggerFactory } from './logger';
import { JobPage, SearchPage } from './pages';
import { CaptchaStep, Client, LoginStep } from './steps';
import { RepeaterUtil, StringUtil, TimeUtil } from './utils';

export class App {
    private readonly axios = new Axios({});

    private readonly captchaStep = new CaptchaStep(new Client(this.axios, config.captcha.key));

    private readonly loginStep: LoginStep;

    private readonly searchPage = new SearchPage(this.axios, config.hh.apiHost);

    private readonly jobPage: JobPage;

    private readonly blackListChecker = StringUtil.getIncludeChecker(config.job.blackListWords);

    private readonly logger = LoggerFactory.getLogger(App.name);

    private timer?: NodeJS.Timeout;

    private static logger = LoggerFactory.getLogger(App.name);

    constructor(driver: WebDriver) {
        this.loginStep = new LoginStep(driver, this.captchaStep, config.hh, config.hh.webHost);
        this.jobPage = new JobPage(driver, config.hh.webHost);
    }

    public async start(): Promise<void> {
        this.logger.info('Starting application');
        await this.loginStep.login();

        await this.processAndSchedule();
    }

    private async processAndSchedule(): Promise<void> {
        if (this.timer) {
            this.logger.info('Processing already scheduled, skipping this try');

            return;
        }
        this.logger.info('Task starting');
        try {
            await this.process();
            this.logger.info('Task finished');
        } catch (e) {
            this.logger.error('Handled global error from scheduled task', {
                errorMessage: e instanceof Error ? e.message : undefined,
            });
        }

        setTimeout(async () => this.processAndSchedule(), TimeUtil.ONE_HOUR_IN_MILLISECOND);
    }

    private async process(): Promise<void> {
        const jobs = await this.searchPage.getOffers(config.job.positions, {
            salary: config.job.salary,
        });

        for (const job of jobs) {
            if (this.blackListChecker.isInclude(job.name)) {
                this.logger.info(`Job is skipping, black list reason`, { jobId: job.id, title: job.name });
                continue;
            }

            try {
                await this.jobPage.apply(job);
            } catch (e) {
                this.logger.warn(`Job with id ${job.id} skipped, while error`);
                continue;
            }
        }
    }

    public static async main(): Promise<App> {
        App.logger.info('Loading needed dependencies');
        try {
            const driver = await RepeaterUtil.exec(
                () => new Builder().usingServer(config.browser.url).forBrowser(Browser.FIREFOX).build(),
                'Browser'
            );

            App.logger.info('Successfully loaded dependencies');

            return new Proxy(new App(driver), {
                get(t, p, r): unknown {
                    const original = Reflect.get(t, p, r);

                    const decorated = async (...args: unknown[]): Promise<unknown> => {
                        try {
                            return await original.call(t, args);
                        } catch (e) {
                            App.logger.info('Releasing the driver');
                            await driver.quit();
                            App.logger.info('Driver successes released');
                            throw e;
                        }
                    };

                    return p === 'start' ? decorated : original;
                },
            });
        } catch (e) {
            if (e instanceof Error) App.logger.info(`Error while loading dependency: ${e.message}`);
            throw e;
        }
    }
}
