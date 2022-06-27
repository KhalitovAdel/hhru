export class IncludeChecker {
    private readonly substringsRegexp: RegExp[];

    constructor(substrings: string[]) {
        this.substringsRegexp = substrings.map((s) => new RegExp(`\\b${s}\\b`, 'gi'));
    }

    public isInclude(str: string): boolean {
        return this.substringsRegexp.some((r) => r.test(str));
    }
}
