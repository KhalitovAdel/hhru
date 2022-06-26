import { join } from 'path';

import { env } from './env';

export const config = Object.freeze({
    ...env,
    hh: Object.freeze({
        ...env.hh,
        apiHost: 'https://api.hh.ru',
        webHost: 'https://hh.ru',
    }),
    logs: {
        folder: join(process.cwd(), 'logs'),
    },
    browser: Object.freeze({
        ...env.browser,
        url: env.browser.url || 'http://0.0.0.0:4444',
    }),
    job: Object.freeze({
        ...env.job,
        blackListWords: (env.job.blackListWords?.split(',') || []).map((s) => s.trim()),
        salary: env.job.salary ? +env.job.salary : undefined,
        positions: env.job.positions.split(','),
    }),
});
