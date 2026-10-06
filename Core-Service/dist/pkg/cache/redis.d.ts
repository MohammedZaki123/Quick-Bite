import type { ICacheProvider } from "./cache.interface";
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}
export declare class RedisCacheProvider implements ICacheProvider {
    private readonly client;
    constructor(config: RedisConfig);
    set(key: string, value: any, ttlSeconds?: number): Promise<any>;
    get(key: string): Promise<any>;
    del(key: string): Promise<any>;
}
