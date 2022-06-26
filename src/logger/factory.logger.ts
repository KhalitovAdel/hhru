import winston, { format } from 'winston';

import { defaultLogger } from './default.logger';

export class LoggerFactory {
    private static readonly LEVEL = Symbol.for('level');

    public static getLogger(name: string): winston.Logger {
        return defaultLogger.child({ name });
    }

    public static filterOnly(level: string): winston.Logform.Format {
        return format((info) => {
            if (Object.getOwnPropertyDescriptor(info, LoggerFactory.LEVEL)?.value === level) {
                return info;
            }

            return false;
        })();
    }
}
