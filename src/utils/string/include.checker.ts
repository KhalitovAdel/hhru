export class IncludeChecker {
    private readonly substrings: string[];

    constructor(substrings: string[]) {
        this.substrings = substrings.map((s) => s.toLowerCase());
    }

    public isInclude(str: string): boolean {
        const lowerCaseStr = str.toLowerCase();

        return this.substrings.some((s) => lowerCaseStr.includes(s));
    }
}
