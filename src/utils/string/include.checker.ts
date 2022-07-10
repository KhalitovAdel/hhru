export class IncludeChecker {
    private readonly substringsRegexp: RegExp[];

    constructor(substrings: string[]) {
        this.substringsRegexp = substrings.map((s) => new RegExp(`\\b${IncludeChecker.sanitizeWord(s)}\\b`, 'i'));
    }

    public isInclude(str: string): boolean {
        return this.substringsRegexp.some((r) => r.test(str));
    }

    private static sanitizeWord(str: string): string {
        return str.replace(/\+/g, '\\+');
    }
}
