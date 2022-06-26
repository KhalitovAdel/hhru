export class EnvException extends Error {
    constructor(envName: string) {
        super(`Missing required environment variable ${envName}`);
    }

    public static required(envName: string): string {
        const value = process.env[envName];
        if (!value) throw new EnvException(envName);

        return value;
    }
}
