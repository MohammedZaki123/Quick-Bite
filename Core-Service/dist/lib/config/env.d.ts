export declare const env: {
    port: number;
    db: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        poolMax: number;
        migrationDirectory: string;
        migrationExtension: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    isProduction: boolean;
    cors: {
        origins: string[];
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    mailjet: {
        apiKey: string;
        secretKey: string;
        fromEmail: string;
        fromName: string;
    };
    internal: {
        apiKey: string;
    };
    rabbit: {
        url: string;
        exchange: string;
        batchSize: number;
        drainCron: string;
    };
};
