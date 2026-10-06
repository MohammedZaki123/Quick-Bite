import { Knex } from "knex";
export interface PaginationMeta {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
}
export interface PaginationParams {
    cursor: string;
    limit: number;
    sortBy: string;
    sortOrder: 'desc' | 'asc';
}
export interface FilterParams {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
    value: string | string[];
}
export declare function applyCursorPagination<T>(query: Knex.QueryBuilder, params: PaginationParams): Knex.QueryBuilder;
export declare function applyFilters<T>(query: Knex.QueryBuilder, filters: FilterParams[]): Knex.QueryBuilder;
export declare function buildPaginationResult<T>(rows: T[], limit: number, sortBy: string): {
    data: T[];
    meta: PaginationMeta;
};
