import { Response } from 'express';
import { PaginationMeta } from "./pagination/cursor-pagination";
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    meta?: Object;
}
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number, meta?: Object): void;
export declare function sendPaginated<T>(res: Response, data: T[], meta: PaginationMeta, statusCode?: number): void;
