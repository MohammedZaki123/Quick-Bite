import { Request, Response, NextFunction } from 'express';
import {TOKENS} from "../di/tokens";
import {container} from "../di/container";
import {ICacheProvider} from "../../pkg/cache/cache.interface";


export function withCache(ttl = 3600, userScoped = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{

        const cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);

        // "GET:/user/me"
        let key = `${req.method}:${req.originalUrl}`;

        if(userScoped){
            // "GET:/user/me:123"
            key += `:${req.user?.userId}`;
        }

        const cached = await cacheProvider.get(key)

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(JSON.parse(cached));
        }
        // intercepting send success function to add data in response to the cache logic
        const originalJson = res.json.bind(res);
        res.json = ((body: any) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              cacheProvider.set(key, JSON.stringify(body), ttl);
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        });
        next();
        }catch(err){
            next(err);
        }
    }
}