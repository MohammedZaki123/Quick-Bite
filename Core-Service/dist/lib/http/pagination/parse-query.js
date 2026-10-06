"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = parsePaginationQuery;
exports.parseFilterQuery = parseFilterQuery;
const DEFAULT_SORT_BY = 'createdAt';
function parsePaginationQuery(query, allowedSortBy = ['createdAt']) {
    const sortBy = allowedSortBy.includes(query.sortBy) ? query.sortBy : DEFAULT_SORT_BY;
    return {
        cursor: query.cursor,
        limit: Math.min(1000, Number(query.limit)),
        sortBy: sortBy,
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    };
}
// filters example for demonstration:
// filter: {
//     name: { like: 'John' },
//     age: { gt: 30 , lt: 50},
// }
function parseFilterQuery(query, allowedFields) {
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
            .map(([operator, value]) => ({
            field,
            operator: operator,
            value: value,
        }));
    });
}
