"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotency = idempotency;
const container_1 = require("../di/container");
const tokens_1 = require("../di/tokens");
const time_1 = require("../../pkg/utils/time");
const TTL = (0, time_1.toSeconds)(1, 'd');
function idempotency(options = {}) {
    return async (req, res, next) => {
        if (!["POST", "PATCH", "PUT"].includes(req.method)) {
            return next();
        }
        // get idempotency-key from header request
        //  if it is not provided in non-strict mode, skips to next layer
        //  In strict mode, return 400 error
        const idempotencyKey = req.headers["idempotency-key"];
        if (!idempotencyKey) {
            if (!options.strict) {
                return next();
            }
            return res.status(400).json({
                error: "Missing Idempotency-Key header",
            });
        }
        try {
            const cacheProvider = container_1.container.resolve(tokens_1.TOKENS.CacheProvider);
            let key = `${req.method}:${req.originalUrl}:${idempotencyKey}`;
            const cached = await cacheProvider.get(key);
            // POST:/api/restaurants/4/members:abc124
            if (cached) {
                const cachedData = JSON.parse(cached);
                // Return cached response with the same status code that was originally used
                res.status(cachedData.statusCode || 200).json({
                    data: cachedData.data,
                });
                return;
            }
            const originalJson = res.json.bind(res);
            const originalStatus = res.status.bind(res);
            let statusCode = 200;
            // Intercept status calls to capture the status code
            res.status = function (code) {
                statusCode = code;
                return originalStatus(code);
            };
            res.json = function (body) {
                // Cache with status code included
                const cachePayload = {
                    ...body,
                    statusCode: statusCode
                };
                cacheProvider.set(key, JSON.stringify(cachePayload), TTL);
                return originalJson(body);
            };
            next();
        }
        catch {
            if (options.strict) {
                return res.status(503).json({
                    error: "Idempotency service unavailable",
                });
            }
            next();
        }
    };
}
