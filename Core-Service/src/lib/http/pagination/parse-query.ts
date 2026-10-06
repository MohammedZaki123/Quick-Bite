import {FilterParams} from "./cursor-pagination";
import type {PaginationParams} from "./cursor-pagination";

const DEFAULT_SORT_BY = 'createdAt';


export function parsePaginationQuery(query: Record<string, any>, allowedSortBy: string[] = ['createdAt']): PaginationParams {
    const sortBy = allowedSortBy.includes(query.sortBy as string)? query.sortBy as string: DEFAULT_SORT_BY;

    return {
        cursor: query.cursor as string,
        limit: Math.min(1000, Number(query.limit)),
        sortBy: sortBy,
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    }
}

// filters example for demonstration:
// filter: {
//     name: { like: 'John' },
//     age: { gt: 30 , lt: 50},
// }

export function parseFilterQuery(query: Record<string, any>, allowedFields: string[]): FilterParams[] {
    const filter = query.filter;
    if (!filter || typeof filter !== 'object') {
        return [];
    }

    const allowedOps = new Set(['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'like']);
    return allowedFields.flatMap((field) => {
        const fieldFilter = filter[field];
        if (!fieldFilter || typeof fieldFilter !== 'object') {
            return [];
        }

        return Object.entries(fieldFilter)
            .filter(([op]) => allowedOps.has(op))
            .map(([operator, value]) => (
                {
                field,
                operator: operator as FilterParams['operator'],
                value: value as string | string[],
            } ));
     });
}
