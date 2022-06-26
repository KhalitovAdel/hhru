import { Axios } from 'axios';

import { Job, Pagination } from '../interfaces';
import { LoggerFactory } from '../logger';

interface SearchOptions {
    text: string;
    salary?: number;
}

export class SearchPage {
    private readonly logger = LoggerFactory.getLogger(SearchPage.name);

    private readonly url: URL;

    constructor(private readonly http: Axios, host: string) {
        this.url = new URL('vacancies', host);
    }

    public async getOffers(positions: string[], opts?: Omit<SearchOptions, 'text'>): Promise<Job[]> {
        return Promise.all(positions.map(async (text) => this.getOffersByOnePosition({ text, ...(opts || {}) }))).then(
            (d) => d.flat()
        );
    }

    public async getOffersByOnePosition(opts: SearchOptions): Promise<Job[]> {
        this.logger.info('Try to find jobs');
        const { items, pages } = await this.get(opts);
        const neededPages = Array.from({ length: pages - 1 }, (k, i) => i + 1);

        const otherPages = await Promise.all(neededPages.map(async (page) => this.get(opts, page)));
        const result = [...otherPages.map((p) => p.items), items].flat(2);

        this.logger.info('Found some jobs', { jobCount: result.length, position: opts.text });

        return result;
    }

    private async get(opts: SearchOptions, page = 0): Promise<Pagination> {
        const url = new URL(this.url);

        url.searchParams.append('text', opts.text);
        url.searchParams.append('per_page', String(100));
        url.searchParams.append('page', String(page));

        if (opts.salary) {
            url.searchParams.append('salary', String(opts.salary));
            url.searchParams.append('only_with_salary', String(true));
        }

        const { data } = await this.http.request<string>({
            method: 'GET',
            url: url.href,
        });

        return JSON.parse(data) as Pagination;
    }
}
