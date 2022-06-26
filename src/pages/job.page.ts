import { By, until, WebDriver } from 'selenium-webdriver';
import * as winston from 'winston';

import config from '../config';
import { Job } from '../interfaces';
import { LoggerFactory } from '../logger';
import { TimeUtil } from '../utils';

export class JobPage {
    private readonly url: URL;

    private readonly logger = LoggerFactory.getLogger(JobPage.name);

    private navigation = Object.freeze({
        applyButton: By.css('a[data-qa="vacancy-response-link-top"]'),
        limitFrame: By.className('bloko-translate-guard'),
        alreadyApplyFrame: By.className('vacancy-response__already-replied'),
    });

    constructor(private readonly driver: WebDriver, host: string) {
        this.url = new URL('vacancy/', host);
        this.logger.add(
            new winston.transports.File({
                dirname: config.logs.folder,
                filename: 'error.log',
                level: 'error',
                format: LoggerFactory.filterOnly('error'),
            })
        );
        this.logger.add(
            new winston.transports.File({
                dirname: config.logs.folder,
                filename: 'success.log',
                level: 'verbose',
                format: LoggerFactory.filterOnly('verbose'),
            })
        );
    }

    public async apply(job: Job): Promise<void> {
        const meta = { jobId: job.id, title: job.name };
        try {
            await this.driver.get(new URL(job.id, this.url).href);
            if (await this.isApplied()) {
                this.logger.info('Job already applied', meta);

                return;
            }

            await this.driver
                .findElement(this.navigation.applyButton)
                .click()
                .catch(async () => Promise.reject(new Error(`Failed to click apply button`)));

            await Promise.race([
                this.driver
                    .wait(
                        until.elementsLocated(this.navigation.alreadyApplyFrame),
                        10 * TimeUtil.ONE_SECOND_IN_MILLISECOND
                    )
                    .catch((e) => e),
                this.driver
                    .wait(until.elementsLocated(this.navigation.limitFrame), 10 * TimeUtil.ONE_SECOND_IN_MILLISECOND)
                    .catch((e) => e),
            ]);

            if (await this.isDailyLimit()) {
                this.logger.info('Daily limit', meta);

                return;
            }

            if (!(await this.isApplied())) {
                throw new Error(`Result is not successes, need extra action`);
            }

            this.logger.verbose('Job applied successfully', meta);
        } catch (error) {
            this.logger.error(`Couldn't apply`, {
                ...meta,
                errorMessage: error instanceof Error ? error.message : undefined,
            });
            throw error;
        }
    }

    private async isApplied(): Promise<boolean> {
        await this.driver
            .wait(until.elementLocated(this.navigation.alreadyApplyFrame), 5 * TimeUtil.ONE_SECOND_IN_MILLISECOND)
            .catch((e) => e);
        return this.driver.findElement(this.navigation.alreadyApplyFrame).then(
            () => true,
            () => false
        );
    }

    private async isDailyLimit(): Promise<boolean> {
        return this.driver.findElement(this.navigation.limitFrame).then(
            async (el) => /^В течение 24 часов/.test(await el.getText()),
            () => false
        );
    }
}
