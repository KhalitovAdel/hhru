import { IncludeChecker } from '../../../src/utils/string/include.checker';
import * as constants from './include.checker.constants';

describe.each([...constants.blackListMap])('IncludeChecker %p', (blackWords, testStrings) => {
    let checker: IncludeChecker;

    beforeEach(() => {
        checker = new IncludeChecker(blackWords);
    });

    it.each(testStrings)('in %p', (word) => {
        expect(checker.isInclude(word)).toBeTruthy();
    });

    it.each([
        ...constants.nodejs,
        ...constants.javascript,
        ...constants.typescript,
        ...constants.react,
        ...constants.vue,
        ...constants.angular,
        ...constants.unknown,
    ])('not in %p', (word) => {
        expect(checker.isInclude(word)).toBeFalsy();
    });
});
