import { Request, Response, NextFunction } from 'express';
export declare function withCache(ttl?: number, userScoped?: boolean): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
