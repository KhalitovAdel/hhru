import { Axios } from 'axios';

import config from '../../src/config';
import { SearchPage } from '../../src/pages/search.page';

describe('SearchPage', () => {
    let searchPage: SearchPage;

    beforeAll(() => {
        searchPage = new SearchPage(new Axios({}), config.hh.apiHost);
    });

    test('getOffers', async () => {
        const jobs = await searchPage.getOffersByOnePosition({ text: 'javascript' });

        jobs.forEach((job) =>
            expect(job).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
            })
        );
    });
});
