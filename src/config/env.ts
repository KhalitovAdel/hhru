import 'dotenv/config';

import { EnvException } from './env.exception';

export const env = Object.freeze({
    captcha: Object.freeze({
        key: EnvException.required('CAPTCHA_KEY'),
    }),
    hh: Object.freeze({
        email: EnvException.required('HH_EMAIL'),
        password: EnvException.required('HH_PASSWORD'),
    }),
    browser: Object.freeze({
        url: process.env.BROWSER_URL,
    }),
    job: Object.freeze({
        blackListWords: process.env.BLACK_LIST_WORDS,
        positions: EnvException.required('JOB_POSITIONS'),
        salary: process.env.JOB_SALARY,
    }),
});
