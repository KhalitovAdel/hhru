import { IncludeChecker } from './include.checker';

export class StringUtil {
    public static getIncludeChecker(substrings: string[]): IncludeChecker {
        return new IncludeChecker(substrings);
    }
}
