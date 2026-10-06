# Pagination Testing Guide

## Testing Pagination Implementation

This guide provides practical examples for testing the new pagination functionality across all endpoints.

---

## Prerequisites

- API running on `http://localhost:3000`
- Valid authentication token (if required)
- Test data in database

---

## Branch Module Tests

### Test 1: Get All Branches with Default Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "Downtown Branch",
      "countryCode": "EG",
      "lat": 30.0444,
      "lng": 31.2357,
      "isActive": true,
      "deliveryRadius": 5
    },
    // ... up to 10 items (default limit)
  ],
  "meta": {
    "nextCursor": "11",
    "hasMore": true,
    "count": 10
  }
}
```

---

### Test 2: Get Branches with Custom Limit

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=5&sortBy=id&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, ... },
    { "id": 2, ... },
    { "id": 3, ... },
    { "id": 4, ... },
    { "id": 5, ... }
  ],
  "meta": {
    "nextCursor": "6",
    "hasMore": true,
    "count": 5
  }
}
```

---

### Test 3: Get Next Page Using Cursor

**Request (using nextCursor from previous response):**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?cursor=6&limit=5&sortBy=id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "id": 6, ... },
    { "id": 7, ... },
    { "id": 8, ... },
    { "id": 9, ... },
    { "id": 10, ... }
  ],
  "meta": {
    "nextCursor": "11",
    "hasMore": false,
    "count": 5
  }
}
```

---

### Test 4: Filter Branches by Currency

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=10&currency=EGP" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "Cairo Branch",
      "currency": "EGP",
      // ... other fields
    },
    {
      "id": 3,
      "label": "Alexandria Branch",
      "currency": "EGP",
      // ... other fields
    }
  ],
  "meta": {
    "nextCursor": null,
    "hasMore": false,
    "count": 2
  }
}
```

---

### Test 5: Filter by Active Status

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=20&is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Only returns branches where `is_active = true`
- All other active branches included

---

### Test 6: Get Nearby Branches with Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/nearby?lat=30.0444&lng=31.2357&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "restaurant_id": 1,
      "label": "Nearby Branch 1",
      "lat": 30.0500,
      "lng": 31.2400,
      "currency": "EGP",
      "name": "Restaurant 1",
      "logo_url": "https://..."
    },
    // ... more nearby branches
  ],
  "meta": {
    "nextCursor": "16",
    "hasMore": true,
    "count": 15
  }
}
```

---

### Test 7: Nearby Branches with Filter

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/nearby?lat=30.0444&lng=31.2357&limit=10&currency=EGP,KWD" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Returns nearby branches filtered by currency
- Only EGP and KWD currencies included

---

## Product Module Tests

### Test 8: Get Product Categories with Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/categories?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Appetizers",
      "restaurantId": 1,
      "createdAt": "2026-04-13T10:00:00Z",
      "updatedAt": "2026-04-13T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Main Courses",
      "restaurantId": 1,
      "createdAt": "2026-04-13T10:00:00Z",
      "updatedAt": "2026-04-13T10:00:00Z"
    }
    // ... more categories
  ],
  "meta": {
    "nextCursor": "3",
    "hasMore": true,
    "count": 2
  }
}
```

---

### Test 9: Get Categories by Name

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/categories?name=appetizer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Only returns categories matching "appetizer" (partial match)

---

### Test 10: Get Products by Restaurant with Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/products?limit=20&sortBy=id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato and mozzarella",
      "imageUrl": "https://...",
      "restaurantId": 1,
      "categoryId": 1,
      "createdAt": "2026-04-13T10:00:00Z",
      "updatedAt": "2026-04-13T10:00:00Z"
    },
    // ... more products
  ],
  "meta": {
    "nextCursor": "21",
    "hasMore": true,
    "count": 20
  }
}
```

---

### Test 11: Filter Products by Category

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/products?category_id=1,2&limit=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Only products in categories 1 or 2
- Paginated with limit of 15 items

---

### Test 12: Filter Products by Name

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/products?name=pizza&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Only products with "pizza" in name (case-insensitive, partial match)
- Paginated with limit of 10 items

---

### Test 13: Get Products by Branch

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/1/products?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pepperoni Pizza",
      "description": "Pizza with pepperoni",
      "imageUrl": "https://...",
      "restaurantId": 1,
      "categoryId": 1,
      "categoryName": "Pizzas",
      "price": 15.99,
      "stock": 50,
      "isAvailable": true
    },
    // ... more products
  ],
  "meta": {
    "nextCursor": "21",
    "hasMore": true,
    "count": 20
  }
}
```

---

### Test 14: Branch Products with Filters

**Request:**
```bash
curl -X GET "http://localhost:3000/branches/1/products?category_id=1&name=pizza&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Products in category 1
- With "pizza" in name
- From branch 1
- Paginated with limit of 10

---

## Edge Cases & Validation Tests

### Test 15: Invalid Limit

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=invalid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Error response (implementation dependent)
- Or uses default limit of 10

---

### Test 16: Cursor Beyond Last Record

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?cursor=999&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [],
  "meta": {
    "nextCursor": null,
    "hasMore": false,
    "count": 0
  }
}
```

---

### Test 17: Backward Compatibility (No Pagination)

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Works without pagination parameters
- Returns all branches (or uses default limit)
- Includes pagination metadata

---

### Test 18: Invalid Restaurant ID

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/99999/branches" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Error: "Restaurant Not Found" (404)

---

### Test 19: Sorting in Descending Order

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=10&sortBy=id&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Branches sorted by ID in descending order
- Highest IDs first

---

### Test 20: Multiple Filters Combined

**Request:**
```bash
curl -X GET "http://localhost:3000/restaurants/1/branches?is_active=true&currency=EGP&limit=5&sortBy=label" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
- Only active branches
- Only EGP currency
- Sorted by label
- Limited to 5 results
- All filters applied together

---

## Performance Testing

### Load Test: Large Dataset

**Scenario:**
- Restaurant with 10,000 branches
- Test pagination performance

**Request:**
```bash
# First page
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=100&sortBy=id"

# Later page
curl -X GET "http://localhost:3000/restaurants/1/branches?limit=100&cursor=5000&sortBy=id"
```

**Expected:**
- Both requests should respond in similar time (<100ms)
- Cursor-based pagination avoids OFFSET scanning
- No performance degradation on later pages

---

## Postman Collection Example

```json
{
  "info": {
    "name": "Pagination Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Branches - First Page",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/restaurants/1/branches?limit=10&sortBy=id",
          "host": ["{{baseUrl}}"],
          "path": ["restaurants", "1", "branches"],
          "query": [
            { "key": "limit", "value": "10" },
            { "key": "sortBy", "value": "id" }
          ]
        }
      }
    },
    {
      "name": "Get Branches - Next Page",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/restaurants/1/branches?limit=10&cursor={{nextCursor}}&sortBy=id",
          "host": ["{{baseUrl}}"],
          "path": ["restaurants", "1", "branches"],
          "query": [
            { "key": "limit", "value": "10" },
            { "key": "cursor", "value": "{{nextCursor}}" },
            { "key": "sortBy", "value": "id" }
          ]
        }
      }
    },
    {
      "name": "Get Nearby Branches",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/branches/nearby?lat=30.0444&lng=31.2357&limit=15",
          "host": ["{{baseUrl}}"],
          "path": ["branches", "nearby"],
          "query": [
            { "key": "lat", "value": "30.0444" },
            { "key": "lng", "value": "31.2357" },
            { "key": "limit", "value": "15" }
          ]
        }
      }
    }
  ]
}
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `nextCursor` is null on first page | Only 1 page of results | This is correct behavior |
| Empty data array | Cursor beyond last record | Use previous cursor or start from beginning |
| Unexpected results | Wrong sort field | Verify sortBy field exists and is indexed |
| Slow performance | Missing database index | Create index on sort field |
| Filters not working | Wrong field names | Check allowed filters for endpoint |

---

## Notes

- All pagination parameters are **optional**
- Omitting pagination returns all results (backward compatible)
- Cursor-based pagination is **stateless** (no server state needed)
- Sort field should be **indexed** in database for best performance
- Filters support partial matching with LIKE operator
- Multiple filter values use IN operator

