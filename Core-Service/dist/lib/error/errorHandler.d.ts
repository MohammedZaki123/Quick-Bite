import type { Request, Response, NextFunction } from "express";
import type { AppError } from "./AppError";
export declare function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>>;
