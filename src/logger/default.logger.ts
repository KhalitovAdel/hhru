import * as winston from 'winston';

export const defaultLogger = winston.createLogger({
    transports: [new winston.transports.Console({ level: 'verbose' })],
});
