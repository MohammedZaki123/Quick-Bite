"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheProvider = void 0;
const redis_1 = require("../../pkg/cache/redis");
const env_1 = require("../config/env");
exports.cacheProvider = new redis_1.RedisCacheProvider({
    host: env_1.env.redis.host,
    port: env_1.env.redis.port,
    password: env_1.env.redis.password,
});
