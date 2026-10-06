import {Request, Response, NextFunction} from "express";
import {container} from "../di/container";
import {TOKENS} from "../di/tokens";
import {ICacheProvider} from "../../pkg/cache/cache.interface";
import {toSeconds} from "../../pkg/utils/time";

interface IdempotencyOptions {
    strict?: boolean;
}
const TTL = toSeconds(1,'d')
export function idempotency(options: IdempotencyOptions = {}){
    return async (req: Request, res: Response, next: NextFunction)=>{
        if (!["POST", "PATCH", "PUT"].includes(req.method)) {
            return next();
        }
    // get idempotency-key from header request
    //  if it is not provided in non-strict mode, skips to next layer
    //  In strict mode, return 400 error
        const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
        if(!idempotencyKey){
            if(!options.strict){
                return next();
            }
            return res.status(400).json({
                error: "Missing Idempotency-Key header",
            });
        }
        try{
            const cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);
            let key = `${req.method}:${req.originalUrl}:${idempotencyKey}`;
            const cached = await cacheProvider.get(key);
            // POST:/api/restaurants/4/members:abc124
            if(cached){
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
            res.status = function(code: number) {
                statusCode = code;
                return originalStatus(code);
            }

            res.json = function(body: any) {
                // Cache with status code included
                const cachePayload = {
                    ...body,
                    statusCode: statusCode
                };
                cacheProvider.set(key, JSON.stringify(cachePayload), TTL);
                return originalJson(body);
            }
            next();
        }catch{
            if(options.strict){
                return res.status(503).json({
                    error: "Idempotency service unavailable",
                });
            }
            next();
        }
    }
}