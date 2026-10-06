"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheProvider = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCacheProvider {
    client;
    constructor(config) {
        this.client = new ioredis_1.default({
            host: config.host,
            port: config.port,
            password: config.password,
            lazyConnect: true,
            maxRetriesPerRequest: 3,
        });
        this.client.on('error', (err) => { console.error("Redis error:", err.message); });
        this.client.connect().catch((err) => { console.error("Failed to connect to Redis:", err.message); });
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
        // return Promise.resolve();
    }
    async get(key) {
        return this.client.get(key);
    }
    async del(key) {
        this.client.del(key);
    }
}
exports.RedisCacheProvider = RedisCacheProvider;
