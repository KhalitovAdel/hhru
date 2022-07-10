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

    it.each(testStrings)('in %p works one more time', (word) => {
        expect(checker.isInclude(word)).toBeTruthy();
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

describe('IncludeChecker', () => {
    let checker: IncludeChecker;

    beforeAll(() => {
        checker = new IncludeChecker([...constants.blackListMap].map((e) => e[0]).flat());
    });

    it('personal cases', () => {
        expect(checker.isInclude('Java Team Lead')).toBeTruthy();
        expect(checker.isInclude('Senior C++ Developer (графика OpenGL/WebGL)')).toBeTruthy();
        expect(checker.isInclude('C# Lead / Senior разработчик (.net, back-end)')).toBeTruthy();
    });
});
