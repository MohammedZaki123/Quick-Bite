import knex, {Knex} from "knex";

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
    operator: 'eq'| 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
    value: string | string[];
}


function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function applyCursorPagination<T>(query: Knex.QueryBuilder, params: PaginationParams): Knex.QueryBuilder {
    if(!params.sortBy){
        return query;
    }
    const column = camelToSnake(params.sortBy);
    if(params.cursor) {
        const op = params.sortOrder === 'asc' ? '>' : '<';
        query = query.where(column, op, params.cursor);
    }
    query = query.orderBy(column, params.sortOrder).limit(params.limit + 1);
    return query
}


export function applyFilters<T>(query: Knex.QueryBuilder, filters: FilterParams[]): Knex.QueryBuilder {
    for(const filter of filters) {
        console.log(filter)
        switch (filter.operator) {
            case 'eq':
                query = query.where (filter.field, filter.value);
                break;
            case 'gt':
                query = query.where(filter.field, '>', filter.value);
                break;
            case 'lt':
                query = query.where(filter.field, '<', filter.value);
                break;
            case 'gte':
                query = query.where(filter.field, '>=', filter.value);
                break;
            case 'lte':
                query = query.where(filter.field, '<=', filter.value);
                break;
            case 'in':
                query = query.whereIn(filter.field, Array.isArray(filter.value) ? filter.value : [filter.value]);
                break;
            case 'like':
                query = query.whereLike(filter.field,  `%${filter.value}%`);
                break;
        }
    }
    return query;
}


export function buildPaginationResult<T>(rows: T[], limit: number, sortBy: string): {data: T[], meta: PaginationMeta} {
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    let nextCursor = null;
    if(data.length > 0){
        const lastItem = data[data.length - 1] as any;
        nextCursor = hasMore && lastItem? String(lastItem[sortBy]) : null;
    }
    return {
        data,
        meta: {
            nextCursor,
            hasMore,
            count: data.length
        }
    }
}