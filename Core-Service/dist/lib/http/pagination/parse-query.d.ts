import { FilterParams } from "./cursor-pagination";
import type { PaginationParams } from "./cursor-pagination";
export declare function parsePaginationQuery(query: Record<string, any>, allowedSortBy?: string[]): PaginationParams;
export declare function parseFilterQuery(query: Record<string, any>, allowedFields: string[]): FilterParams[];
