import { Request, Response, NextFunction } from "express";
interface IdempotencyOptions {
    strict?: boolean;
}
export declare function idempotency(options?: IdempotencyOptions): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
