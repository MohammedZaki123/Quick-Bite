"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCache = withCache;
const tokens_1 = require("../di/tokens");
const container_1 = require("../di/container");
function withCache(ttl = 3600, userScoped = false) {
    return async (req, res, next) => {
        try {
            const cacheProvider = container_1.container.resolve(tokens_1.TOKENS.CacheProvider);
            // "GET:/user/me"
            let key = `${req.method}:${req.originalUrl}`;
            if (userScoped) {
                // "GET:/user/me:123"
                key += `:${req.user?.userId}`;
            }
            const cached = await cacheProvider.get(key);
            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(JSON.parse(cached));
            }
            // intercepting send success function to add data in response to the cache logic
            const originalJson = res.json.bind(res);
            res.json = ((body) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheProvider.set(key, JSON.stringify(body), ttl);
                }
                res.setHeader('X-Cache', 'MISS');
                return originalJson(body);
            });
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
