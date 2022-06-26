import { LoggerFactory } from '../logger';
import { TimeUtil } from './time.util';

export class RepeaterUtil {
    private static readonly logger = LoggerFactory.getLogger(RepeaterUtil.name);

    public static async exec<T>(
        cb: () => T | Promise<T>,
        subject: string,
        attemptsCount = 10,
        delay = 30 * TimeUtil.ONE_SECOND_IN_MILLISECOND
    ): Promise<T> {
        let lastError: unknown;
        for (const attempt of Array.from({ length: attemptsCount }, (k, i) => i + 1)) {
            try {
                return await cb();
            } catch (e) {
                RepeaterUtil.logger.warn(`${subject} executing ${attempt} out of ${attemptsCount} attempts`);
                if (attempt !== attemptsCount) await new Promise((res) => setTimeout(res, delay));
                lastError = e;
                continue;
            }
        }

        throw lastError;
    }
}
