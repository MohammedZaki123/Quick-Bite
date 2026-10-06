"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
const envFile = process.env.DOTENV_CONFIG_PATH ?? (process.env.NODE_ENV === "test" ? ".env.test" : ".env");
const result = (0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, "../../../", envFile) });
if (result.parsed) {
    for (const k in result.parsed) {
        if (!process.env[k]) {
            process.env[k] = result.parsed[k];
        }
    }
}
const schema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.string().default('5432'),
    DB_USERNAME: zod_1.z.string().default('postgres'),
    DB_PASSWORD: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    DB_POOL_MAX: zod_1.z.string().default('10'),
    DB_MIGRATION_DIRECTORY: zod_1.z.string(),
    DB_MIGRATION_EXTENSION: zod_1.z.string(),
    ACCESS_SECRET: zod_1.z.string(),
    REFRESH_SECRET: zod_1.z.string(),
    ACCESS_EXPIRES_IN: zod_1.z.string(),
    REFRESH_EXPIRES_IN: zod_1.z.string(),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379'),
    REDIS_PASSWORD: zod_1.z.string().default(''),
    MAILJET_API_KEY: zod_1.z.string(),
    MAILJET_SECRET_KEY: zod_1.z.string(),
    MAILJET_FROM_EMAIL: zod_1.z.string(),
    MAILJET_FROM_NAME: zod_1.z.string(),
    INTERNAL_API_KEY: zod_1.z.string().default(''),
    // RabbitMQ — used by the outbox worker.
    RABBITMQ_URL: zod_1.z.string().default("amqp://guest:guest@localhost:5672"),
    RABBITMQ_CORE_EVENTS_EXCHANGE: zod_1.z.string().default("core.events"),
    // Cron expression for the outbox drain schedule. 6-field form; "* * * * * *" = every second.
    OUTBOX_DRAIN_CRON: zod_1.z.string().default("* * * * * *"),
    OUTBOX_BATCH_SIZE: zod_1.z.string().default("50"),
});
const parsed = schema.parse(process.env);
exports.env = {
    port: Number(parsed.PORT),
    db: {
        host: parsed.DB_HOST,
        port: Number(parsed.DB_PORT),
        username: parsed.DB_USERNAME,
        password: parsed.DB_PASSWORD,
        name: parsed.DB_NAME,
        poolMax: Number(parsed.DB_POOL_MAX),
        // C:\Users\Lenovo\IdeaProjects\Quick-Bite\Core-Service\src\migrations
        migrationDirectory: path_1.default.resolve(__dirname, "../../../", parsed.DB_MIGRATION_DIRECTORY),
        migrationExtension: parsed.DB_MIGRATION_EXTENSION,
    },
    jwt: {
        accessSecret: parsed.ACCESS_SECRET,
        refreshSecret: parsed.REFRESH_SECRET,
        accessExpiresIn: parsed.ACCESS_EXPIRES_IN,
        refreshExpiresIn: parsed.REFRESH_EXPIRES_IN,
    },
    isProduction: process.env.NODE_ENV === "production",
    cors: {
        origins: parsed.CORS_ORIGINS.split(",")
    },
    redis: {
        host: parsed.REDIS_HOST,
        port: Number(parsed.REDIS_PORT),
        password: parsed.REDIS_PASSWORD,
    },
    mailjet: {
        apiKey: parsed.MAILJET_API_KEY,
        secretKey: parsed.MAILJET_SECRET_KEY,
        fromEmail: parsed.MAILJET_FROM_EMAIL,
        fromName: parsed.MAILJET_FROM_NAME,
    },
    internal: {
        apiKey: parsed.INTERNAL_API_KEY,
    },
    rabbit: {
        url: parsed.RABBITMQ_URL,
        exchange: parsed.RABBITMQ_CORE_EVENTS_EXCHANGE,
        batchSize: Number(parsed.OUTBOX_BATCH_SIZE) || 10,
        drainCron: parsed.OUTBOX_DRAIN_CRON,
    }
};
