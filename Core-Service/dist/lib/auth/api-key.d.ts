import type { Request, Response, NextFunction } from "express";
export declare function requireInternalApiKey(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
