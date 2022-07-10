import * as winston from 'winston';

export const defaultLogger = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console({ level: 'verbose' })],
});
