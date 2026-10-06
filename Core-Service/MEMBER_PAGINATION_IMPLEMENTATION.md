# Member Listing Pagination Implementation

## Overview
Added cursor-based pagination support to the member listing endpoint (`GET /restaurants/:restaurantId/members`), matching the same pagination pattern used throughout the application.

## Changes Made

### 1. **Repository Layer** (`src/app/rbac/repository/restaurant-member.repo.ts`)
- Added imports for pagination utilities:
  - `PaginationParams`
  - `applyCursorPagination`
  - `FilterParams`
  - `applyFilters`

- Updated `findMembersByRestaurantId()` function signature:
  ```typescript
  export async function findMembersByRestaurantId(
    restaurantId: number, 
    params?: PaginationParams, 
    filters?: FilterParams[]
  )
  ```

- Added `m.created_at` to the SELECT clause to support sorting by creation date
- Applied filters using `applyFilters()` when provided
- Applied cursor pagination using `applyCursorPagination()` when provided

### 2. **Service Layer** (`src/app/rbac/service/member.service.ts`)
- Added imports for pagination utilities
- Updated `listMembers()` method signature:
  ```typescript
  listMembers = async (
    restaurantId: number, 
    params?: PaginationParams, 
    filters?: FilterParams[]
  )
  ```

- Calls `buildPaginationResult()` when pagination params are provided
- Returns standard pagination response with metadata (nextCursor, hasMore, count)

### 3. **Controller Layer** (`src/app/rbac/controller/member.controller.ts`)
- Added imports:
  - `sendPaginated` (for sending paginated responses)
  - `parseFilterQuery` and `parsePaginationQuery` (for parsing query parameters)
  - `PaginationParams` type

- Updated `listMembers()` controller method to:
  - Parse pagination query parameters with allowed sort fields: `['id', 'createdAt', 'name', 'email']`
  - Parse filter query parameters with allowed filter fields: `['id', 'name', 'email', 'status']`
  - Use `sendPaginated()` to send the response with metadata

## API Usage

### Request Format
```
GET /restaurants/:restaurantId/members?limit=10&cursor=abc123&sortBy=createdAt&sortOrder=asc&filter[name][like]=John&filter[status][eq]=active
```

### Query Parameters
- `limit` - Number of results per page (default: computed from query, max: 1000)
- `cursor` - Cursor value from previous response for getting next page
- `sortBy` - Field to sort by (allowed: `id`, `createdAt`, `name`, `email`, default: `createdAt`)
- `sortOrder` - Sort direction: `asc` or `desc` (default: `asc`)
- `filter` - Filter conditions in format: `filter[fieldName][operator]=value`

### Supported Filter Operators
- `eq` - Equals
- `gt` - Greater than
- `lt` - Less than
- `gte` - Greater than or equal
- `lte` - Less than or equal
- `in` - In array
- `like` - Contains (LIKE query)

### Filter Examples
```
# Filter by status
filter[status][eq]=active

# Filter by email containing
filter[email][like]=example.com

# Filter by name containing
filter[name][like]=John

# Combine multiple filters
filter[status][eq]=active&filter[name][like]=John
```

### Response Format
```json
{
  "data": [
    {
      "id": 1,
      "userId": 5,
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "admin",
      "roleDisplayName": "Administrator",
      "status": "active",
      "createdAt": "2026-04-17T10:30:00Z"
    }
  ],
  "meta": {
    "nextCursor": "xyz789",
    "hasMore": true,
    "count": 10
  }
}
```

## Default Behavior

When no pagination parameters are provided:
- Returns all members without cursor pagination
- Includes all members in single response
- Meta contains: `nextCursor: null`, `hasMore: false`, `count: totalCount`

## Allowed Sort Fields
- `id` - Member ID
- `createdAt` - Member creation timestamp (default)
- `name` - Member name
- `email` - Member email

## Allowed Filter Fields
- `id` - Member ID
- `name` - Member name
- `email` - Member email
- `status` - Member status (active, inactive, suspended)

## Benefits

✅ **Consistent with other endpoints** - Uses same pagination pattern as products, branches, categories
✅ **Scalable** - Cursor-based pagination doesn't require offset calculations
✅ **Filterable** - Supports filtering by name, email, status
✅ **Sortable** - Allows sorting by multiple fields
✅ **Backward compatible** - Optional parameters, works without pagination params
✅ **Added timestamps** - `createdAt` now returned for sorting purposes

## Example Requests

### Get first page of members
```
GET /restaurants/1/members?limit=10&sortBy=createdAt&sortOrder=desc
```

### Get next page using cursor
```
GET /restaurants/1/members?limit=10&cursor=timestamp-value&sortBy=createdAt&sortOrder=desc
```

### Get members filtered by status
```
GET /restaurants/1/members?limit=10&filter[status][eq]=active
```

### Get members with multiple filters
```
GET /restaurants/1/members?limit=10&filter[status][eq]=active&filter[name][like]=John
```

### Get all members without pagination (old behavior)
```
GET /restaurants/1/members
```

