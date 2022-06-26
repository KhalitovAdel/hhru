import { Job } from './offer.interface';

export interface Pagination {
    items: Job[];
    found: number;
    pages: number;
}
