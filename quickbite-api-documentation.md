# QuickBite API Documentation

## Table of Contents
1. [API Design Principles](#api-design-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Common Patterns](#common-patterns)
4. [Customer APIs](#customer-apis)
5. [Restaurant APIs](#restaurant-apis)
6. [Delivery Agent APIs](#delivery-agent-apis)
7. [Admin APIs](#admin-apis)
8. [Webhook Events](#webhook-events)

---

## API Design Principles

### Base URL
```
Production: https://api.quickbite.com/v1
Staging: https://api-staging.quickbite.com/v1
```

### Standards
- RESTful architecture
- JSON request/response bodies
- ISO 8601 datetime format
- Pagination for list endpoints
- Idempotency keys for write operations
- HTTP status codes following RFC 7231

### Common HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

### Authentication
All API requests require authentication via Bearer token in the Authorization header:

```http
Authorization: Bearer {access_token}
```

### Token Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "name": "John Doe",
  "user_type": "customer"
}
```

**Response:** `201 Created`
```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "user_type": "customer",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600
}
```

#### POST /auth/login
Authenticate and obtain access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "customer"
  }
}
```

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 3600
}
```

#### POST /auth/logout
Invalidate current session.

**Response:** `204 No Content`

---

## Common Patterns

### Pagination
List endpoints support cursor-based pagination:

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `cursor` (opaque cursor string)

**Response Structure:**
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "cur_xyz789",
    "has_more": true,
    "total_count": 150
  }
}
```

### Filtering & Sorting
**Query Parameters:**
- `filter[field]` - Filter by field value
- `sort` - Sort field (prefix with `-` for descending)

Example: `GET /restaurants?filter[cuisine]=italian&sort=-rating`

### Idempotency
Write operations support idempotency via header:
```http
Idempotency-Key: {unique_key}
```

### Error Response Format
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

---

## Customer APIs

### User Profile

#### GET /customers/me
Get current customer profile.

**Response:** `200 OK`
```json
{
  "customer_id": "cust_abc123",
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "created_at": "2024-01-15T10:30:00Z",
  "default_address": {
    "address_id": "addr_xyz789",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
}
```

#### PATCH /customers/me
Update customer profile.

**Request:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891"
}
```

**Response:** `200 OK` (returns updated profile)

### Addresses

#### GET /customers/me/addresses
List customer addresses.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "address_id": "addr_xyz789",
      "label": "Home",
      "street": "123 Main St",
      "apartment": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "is_default": true,
      "delivery_instructions": "Ring doorbell twice"
    }
  ]
}
```

#### POST /customers/me/addresses
Add new address.

**Request:**
```json
{
  "label": "Office",
  "street": "456 Broadway",
  "apartment": "Suite 100",
  "city": "New York",
  "state": "NY",
  "zip": "10013",
  "coordinates": {
    "latitude": 40.7204,
    "longitude": -74.0014
  },
  "is_default": false,
  "delivery_instructions": "Leave at reception"
}
```

**Response:** `201 Created`

#### PATCH /customers/me/addresses/{address_id}
Update address.

#### DELETE /customers/me/addresses/{address_id}
Delete address.

**Response:** `204 No Content`

### Restaurant Discovery

#### GET /restaurants
Search and browse restaurants.

**Query Parameters:**
- `latitude` (required for location-based search)
- `longitude` (required for location-based search)
- `cuisine` - Filter by cuisine type
- `min_rating` - Minimum rating (0-5)
- `delivery_time_max` - Max delivery time in minutes
- `min_order` - Minimum order amount
- `search` - Search query
- `is_open` - Filter by open status (true/false)
- `limit` - Results per page
- `cursor` - Pagination cursor

**Response:** `200 OK`
```json
{
  "data": [
    {
      "restaurant_id": "rest_abc123",
      "name": "Pizza Palace",
      "slug": "pizza-palace-downtown",
      "cuisine_types": ["Italian", "Pizza"],
      "rating": 4.5,
      "review_count": 1250,
      "price_range": "$$",
      "image_url": "https://cdn.quickbite.com/restaurants/abc123.jpg",
      "estimated_delivery_time": 30,
      "minimum_order": 15.00,
      "delivery_fee": 2.99,
      "is_open": true,
      "distance_km": 2.3,
      "address": {
        "street": "789 Food Street",
        "city": "New York",
        "state": "NY",
        "zip": "10001"
      },
      "operating_hours": {
        "monday": {"open": "11:00", "close": "22:00"},
        "tuesday": {"open": "11:00", "close": "22:00"}
      }
    }
  ],
  "pagination": {
    "next_cursor": "cur_xyz789",
    "has_more": true
  }
}
```

#### GET /restaurants/{restaurant_id}
Get restaurant details.

**Response:** `200 OK` (detailed restaurant object)

### Menu

#### GET /restaurants/{restaurant_id}/menu
Get restaurant menu.

**Response:** `200 OK`
```json
{
  "restaurant_id": "rest_abc123",
  "categories": [
    {
      "category_id": "cat_abc123",
      "name": "Pizzas",
      "description": "Hand-tossed traditional pizzas",
      "display_order": 1,
      "items": [
        {
          "item_id": "item_xyz789",
          "name": "Margherita Pizza",
          "description": "Fresh mozzarella, basil, tomato sauce",
          "price": 12.99,
          "image_url": "https://cdn.quickbite.com/items/xyz789.jpg",
          "is_available": true,
          "is_vegetarian": true,
          "calories": 850,
          "preparation_time": 15,
          "customizations": [
            {
              "customization_id": "cust_abc123",
              "name": "Size",
              "required": true,
              "max_selections": 1,
              "options": [
                {
                  "option_id": "opt_123",
                  "name": "Small (10\")",
                  "price_modifier": 0.00
                },
                {
                  "option_id": "opt_124",
                  "name": "Large (14\")",
                  "price_modifier": 5.00
                }
              ]
            },
            {
              "customization_id": "cust_abc124",
              "name": "Extra Toppings",
              "required": false,
              "max_selections": 5,
              "options": [
                {
                  "option_id": "opt_125",
                  "name": "Extra Cheese",
                  "price_modifier": 2.00
                },
                {
                  "option_id": "opt_126",
                  "name": "Mushrooms",
                  "price_modifier": 1.50
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### GET /restaurants/{restaurant_id}/menu/items/{item_id}
Get specific menu item details.

### Cart Management

#### GET /customers/me/cart
Get current cart.

**Response:** `200 OK`
```json
{
  "cart_id": "cart_abc123",
  "restaurant_id": "rest_abc123",
  "restaurant_name": "Pizza Palace",
  "items": [
    {
      "cart_item_id": "ci_abc123",
      "item_id": "item_xyz789",
      "name": "Margherita Pizza",
      "quantity": 2,
      "unit_price": 12.99,
      "customizations": [
        {
          "customization_id": "cust_abc123",
          "name": "Size",
          "selected_option": {
            "option_id": "opt_124",
            "name": "Large (14\")",
            "price_modifier": 5.00
          }
        }
      ],
      "subtotal": 35.98,
      "special_instructions": "Extra crispy"
    }
  ],
  "subtotal": 35.98,
  "delivery_fee": 2.99,
  "tax": 3.24,
  "total": 42.21,
  "created_at": "2024-01-28T10:30:00Z",
  "updated_at": "2024-01-28T10:35:00Z"
}
```

#### POST /customers/me/cart/items
Add item to cart.

**Request:**
```json
{
  "restaurant_id": "rest_abc123",
  "item_id": "item_xyz789",
  "quantity": 2,
  "customizations": [
    {
      "customization_id": "cust_abc123",
      "selected_options": ["opt_124"]
    },
    {
      "customization_id": "cust_abc124",
      "selected_options": ["opt_125", "opt_126"]
    }
  ],
  "special_instructions": "Extra crispy"
}
```

**Response:** `201 Created` (returns new cart)

#### PATCH /customers/me/cart/items/{cart_item_id}
Update cart item quantity or customizations.

**Request:**
```json
{
  "quantity": 3,
  "special_instructions": "Well done"
}
```

**Response:** `200 OK` (returns updated cart)

#### DELETE /customers/me/cart/items/{cart_item_id}
Remove item from cart.

**Response:** `200 OK` (returns updated cart)

#### DELETE /customers/me/cart
Clear entire cart.

**Response:** `204 No Content`

### Orders

#### POST /orders
Create new order from cart.

**Headers:**
```
Idempotency-Key: {unique_key}
```

**Request:**
```json
{
  "delivery_address_id": "addr_xyz789",
  "delivery_instructions": "Ring doorbell twice",
  "payment_method": "online",
  "payment_details": {
    "payment_method_id": "pm_abc123"
  },
  "scheduled_delivery": null,
  "tip_amount": 3.00,
  "notes": "Please include extra napkins"
}
```

**For Cash on Delivery:**
```json
{
  "delivery_address_id": "addr_xyz789",
  "delivery_instructions": "Ring doorbell twice",
  "payment_method": "cod",
  "scheduled_delivery": null,
  "tip_amount": 0.00
}
```

**Response:** `201 Created`
```json
{
  "order_id": "ord_abc123",
  "order_number": "QB-2024-001234",
  "status": "pending_restaurant",
  "restaurant": {
    "restaurant_id": "rest_abc123",
    "name": "Pizza Palace",
    "phone": "+1234567890"
  },
  "items": [
    {
      "item_id": "item_xyz789",
      "name": "Margherita Pizza",
      "quantity": 2,
      "unit_price": 12.99,
      "customizations": [...],
      "subtotal": 35.98
    }
  ],
  "delivery_address": {
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "pricing": {
    "subtotal": 35.98,
    "delivery_fee": 2.99,
    "tax": 3.24,
    "tip": 3.00,
    "total": 45.21
  },
  "payment": {
    "method": "online",
    "status": "authorized",
    "payment_id": "pay_abc123"
  },
  "estimated_delivery_time": "2024-01-28T12:00:00Z",
  "created_at": "2024-01-28T11:00:00Z"
}
```

#### GET /orders/{order_id}
Get order details.

**Response:** `200 OK`
```json
{
  "order_id": "ord_abc123",
  "order_number": "QB-2024-001234",
  "status": "out_for_delivery",
  "restaurant": {
    "restaurant_id": "rest_abc123",
    "name": "Pizza Palace",
    "phone": "+1234567890",
    "address": "789 Food Street, New York, NY 10001"
  },
  "items": [...],
  "delivery_address": {...},
  "pricing": {...},
  "payment": {
    "method": "online",
    "status": "captured",
    "payment_id": "pay_abc123"
  },
  "delivery_agent": {
    "agent_id": "agent_abc123",
    "name": "Mike Wilson",
    "phone": "+1234567891",
    "vehicle_type": "bike",
    "current_location": {
      "latitude": 40.7150,
      "longitude": -74.0050
    }
  },
  "timeline": [
    {
      "status": "placed",
      "timestamp": "2024-01-28T11:00:00Z"
    },
    {
      "status": "accepted",
      "timestamp": "2024-01-28T11:02:00Z"
    },
    {
      "status": "preparing",
      "timestamp": "2024-01-28T11:03:00Z"
    },
    {
      "status": "ready_for_pickup",
      "timestamp": "2024-01-28T11:25:00Z"
    },
    {
      "status": "picked_up",
      "timestamp": "2024-01-28T11:30:00Z"
    },
    {
      "status": "out_for_delivery",
      "timestamp": "2024-01-28T11:31:00Z"
    }
  ],
  "estimated_delivery_time": "2024-01-28T12:00:00Z",
  "created_at": "2024-01-28T11:00:00Z",
  "updated_at": "2024-01-28T11:31:00Z"
}
```

#### GET /orders
List customer orders.

**Query Parameters:**
- `status` - Filter by status
- `from_date` - ISO 8601 date
- `to_date` - ISO 8601 date
- `restaurant_id` - Filter by restaurant
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "order_id": "ord_abc123",
      "order_number": "QB-2024-001234",
      "status": "delivered",
      "restaurant_name": "Pizza Palace",
      "total": 45.21,
      "created_at": "2024-01-28T11:00:00Z",
      "delivered_at": "2024-01-28T11:55:00Z"
    }
  ],
  "pagination": {...}
}
```

#### PATCH /orders/{order_id}
Cancel order.

**Request:**
```json
{
  "reason": "Changed my mind",
  "reason_code": "customer_request",
  "status": "cancelled"
}
```

**Response:** `200 OK`
```json
{
  "order_id": "ord_abc123",
  "status": "cancelled",
  "refund": {
    "amount": 45.21,
    "status": "pending",
    "estimated_at": "2024-01-30T11:00:00Z"
  }
}
```

#### GET /orders/{order_id}/track
Real-time order tracking.

**Response:** `200 OK`
```json
{
  "order_id": "ord_abc123",
  "status": "out_for_delivery",
  "current_step": 5,
  "total_steps": 6,
  "estimated_delivery_time": "2024-01-28T12:00:00Z",
  "delivery_agent": {
    "name": "Mike Wilson",
    "phone": "+1234567891",
    "vehicle_type": "bike",
    "current_location": {
      "latitude": 40.7150,
      "longitude": -74.0050,
      "bearing": 45,
      "updated_at": "2024-01-28T11:45:00Z"
    }
  },
  "delivery_route": {
    "from": {
      "latitude": 40.7204,
      "longitude": -74.0014,
      "address": "Pizza Palace"
    },
    "to": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St"
    },
    "distance_km": 1.2,
    "duration_minutes": 8
  }
}
```

### Payment Methods

#### GET /customers/me/payment-methods
List saved payment methods.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "payment_method_id": "pm_abc123",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /customers/me/payment-methods
Add payment method.

**Request:**
```json
{
  "type": "card",
  "card_token": "tok_abc123",
  "is_default": true
}
```

**Response:** `201 Created`

#### DELETE /customers/me/payment-methods/{payment_method_id}
Remove payment method.

**Response:** `204 No Content`

---

## Restaurant APIs

### Restaurant Profile

#### GET /restaurants/me
Get restaurant profile (Owner/Manager/Staff).

**Response:** `200 OK`
```json
{
  "restaurant_id": "rest_abc123",
  "name": "Pizza Palace",
  "slug": "pizza-palace-downtown",
  "owner_id": "user_owner123",
  "email": "owner@pizzapalace.com",
  "phone": "+1234567890",
  "cuisine_types": ["Italian", "Pizza"],
  "description": "Authentic Italian pizzas",
  "image_url": "https://cdn.quickbite.com/restaurants/abc123.jpg",
  "address": {
    "street": "789 Food Street",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "coordinates": {
      "latitude": 40.7204,
      "longitude": -74.0014
    }
  },
  "operating_hours": {
    "monday": {"open": "11:00", "close": "22:00"},
    "tuesday": {"open": "11:00", "close": "22:00"},
    "wednesday": {"open": "11:00", "close": "22:00"},
    "thursday": {"open": "11:00", "close": "22:00"},
    "friday": {"open": "11:00", "close": "23:00"},
    "saturday": {"open": "11:00", "close": "23:00"},
    "sunday": {"open": "12:00", "close": "22:00"}
  },
  "is_open": true,
  "is_accepting_orders": true,
  "minimum_order": 15.00,
  "delivery_fee": 2.99,
  "estimated_prep_time": 20,
  "rating": 4.5,
  "review_count": 1250,
  "region": "us-east-1",
  "created_at": "2023-06-15T10:00:00Z"
}
```

#### PATCH /restaurants/me
Update restaurant profile (Owner only).

**Request:**
```json
{
  "name": "Pizza Palace - Downtown",
  "description": "The best authentic Italian pizzas in town",
  "phone": "+1234567890",
  "minimum_order": 20.00,
  "estimated_prep_time": 25,
  "is_accepting_orders": false
}
```

**Response:** `200 OK` (returns updated profile)

### Menu Management

#### GET /restaurants/me/menu
Get restaurant's menu.

**Response:** `200 OK` (same structure as customer menu view)

#### POST /restaurants/me/menu/categories
Create menu category (Owner/Manager).

**Request:**
```json
{
  "name": "Appetizers",
  "description": "Start your meal right",
  "display_order": 1,
  "is_active": true
}
```

**Response:** `201 Created`

#### PATCH /restaurants/me/menu/categories/{category_id}
Update category (Owner/Manager).

#### DELETE /restaurants/me/menu/categories/{category_id}
Delete category (Owner/Manager).

**Response:** `204 No Content`

#### POST /restaurants/me/menu/items
Create menu item (Owner/Manager).

**Request:**
```json
{
  "category_id": "cat_abc123",
  "name": "Margherita Pizza",
  "description": "Fresh mozzarella, basil, tomato sauce",
  "price": 12.99,
  "image_url": "https://cdn.quickbite.com/items/xyz789.jpg",
  "is_available": true,
  "is_vegetarian": true,
  "is_vegan": false,
  "is_gluten_free": false,
  "calories": 850,
  "preparation_time": 15,
  "customizations": [
    {
      "name": "Size",
      "required": true,
      "max_selections": 1,
      "options": [
        {
          "name": "Small (10\")",
          "price_modifier": 0.00
        },
        {
          "name": "Large (14\")",
          "price_modifier": 5.00
        }
      ]
    }
  ]
}
```

**Response:** `201 Created`

#### PATCH /restaurants/me/menu/items/{item_id}
Update menu item (Owner/Manager).

#### DELETE /restaurants/me/menu/items/{item_id}
Delete menu item (Owner/Manager).

#### PATCH /restaurants/me/menu/items/{item_id}/availability
Toggle item availability (Owner/Manager/Staff).

**Request:**
```json
{
  "is_available": false,
  "unavailable_until": "2024-01-28T18:00:00Z"
}
```

**Response:** `200 OK`

### Order Management

#### GET /restaurants/me/orders
List restaurant orders.

**Query Parameters:**
- `status` - Filter by status (pending, accepted, preparing, ready, picked_up, delivered, cancelled, rejected)
- `from_date` - ISO 8601 date
- `to_date` - ISO 8601 date
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "order_id": "ord_abc123",
      "order_number": "QB-2024-001234",
      "status": "pending_restaurant",
      "customer": {
        "customer_id": "cust_abc123",
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "items": [
        {
          "item_id": "item_xyz789",
          "name": "Margherita Pizza",
          "quantity": 2,
          "customizations": [...]
        }
      ],
      "delivery_address": {
        "street": "123 Main St",
        "apartment": "Apt 4B",
        "city": "New York"
      },
      "pricing": {
        "subtotal": 35.98,
        "tax": 3.24,
        "total": 45.21,
        "restaurant_amount": 32.38
      },
      "payment_method": "online",
      "payment_status": "authorized",
      "notes": "Please include extra napkins",
      "estimated_prep_time": 20,
      "created_at": "2024-01-28T11:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /restaurants/me/orders/{order_id}
Get order details.

#### POST /restaurants/me/orders/{order_id}/accept
Accept order (Owner/Manager).

**Request:**
```json
{
  "estimated_ready_time": "2024-01-28T11:25:00Z"
}
```

**Response:** `200 OK`
```json
{
  "order_id": "ord_abc123",
  "status": "preparing",
  "estimated_ready_time": "2024-01-28T11:25:00Z"
}
```

#### POST /restaurants/me/orders/{order_id}/reject
Reject order (Owner/Manager).

**Request:**
```json
{
  "reason": "Ingredient unavailable",
  "reason_code": "out_of_stock"
}
```

**Response:** `200 OK`

#### PATCH /restaurants/me/orders/{order_id}/status
Update order status (Owner/Manager/Staff).

**Request:**
```json
{
  "status": "ready_for_pickup"
}
```

**Valid status transitions:**
- `pending_restaurant` → `preparing` (via accept)
- `pending_restaurant` → `rejected` (via reject)
- `preparing` → `ready_for_pickup`
- Any status → `cancelled` (with reason)

**Response:** `200 OK`

#### POST /restaurants/me/orders/{order_id}/ready
Mark order ready for pickup (Staff/Manager/Owner).

**Response:** `200 OK`

### Staff Management (RBAC)

#### GET /restaurants/me/staff
List restaurant staff (Owner only).

**Response:** `200 OK`
```json
{
  "data": [
    {
      "user_id": "user_abc123",
      "email": "manager@pizzapalace.com",
      "name": "Jane Smith",
      "role": "manager",
      "status": "active",
      "added_at": "2024-01-15T10:00:00Z",
      "added_by": "user_owner123"
    },
    {
      "user_id": "user_xyz789",
      "email": "staff@pizzapalace.com",
      "name": "Bob Johnson",
      "role": "staff",
      "status": "active",
      "added_at": "2024-01-20T14:00:00Z",
      "added_by": "user_owner123"
    }
  ]
}
```

#### POST /restaurants/me/staff
Add staff member (Owner only).

**Request:**
```json
{
  "email": "newmanager@pizzapalace.com",
  "role": "manager"
}
```

**Roles:** `owner`, `manager`, `staff`

**Response:** `201 Created`

#### PATCH /restaurants/me/staff/{user_id}
Update staff role (Owner only).

**Request:**
```json
{
  "role": "staff"
}
```

**Response:** `200 OK`

#### DELETE /restaurants/me/staff/{user_id}
Remove staff member (Owner only).

**Response:** `204 No Content`

### Financial Management

#### GET /restaurants/me/balance
Get current balance (Owner only).

**Response:** `200 OK`
```json
{
  "restaurant_id": "rest_abc123",
  "current_balance": 5234.67,
  "currency": "USD",
  "pending_orders_amount": 234.50,
  "last_payout": {
    "payout_id": "payout_abc123",
    "amount": 2500.00,
    "date": "2024-01-15T10:00:00Z"
  },
  "updated_at": "2024-01-28T11:00:00Z"
}
```

#### GET /restaurants/me/payouts
List payout history (Owner only).

**Query Parameters:**
- `from_date`
- `to_date`
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "payout_id": "payout_abc123",
      "amount": 2500.00,
      "currency": "USD",
      "status": "completed",
      "method": "bank_transfer",
      "bank_account": {
        "last4": "1234",
        "bank_name": "Chase Bank"
      },
      "initiated_at": "2024-01-14T10:00:00Z",
      "completed_at": "2024-01-15T10:00:00Z",
      "reference_number": "PAY-2024-001"
    }
  ],
  "pagination": {...}
}
```

#### GET /restaurants/me/transactions
List financial transactions (Owner only).

**Query Parameters:**
- `type` - Filter by type (order, payout, refund, commission, adjustment)
- `from_date`
- `to_date`
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "transaction_id": "txn_abc123",
      "type": "order",
      "amount": 32.38,
      "balance_after": 5234.67,
      "order_id": "ord_abc123",
      "order_number": "QB-2024-001234",
      "description": "Order payment",
      "created_at": "2024-01-28T11:00:00Z"
    },
    {
      "transaction_id": "txn_xyz789",
      "type": "commission",
      "amount": -3.62,
      "balance_after": 5231.05,
      "order_id": "ord_abc123",
      "description": "Platform commission (10%)",
      "created_at": "2024-01-28T11:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Analytics

#### GET /restaurants/me/analytics/summary
Get analytics summary (Owner/Manager).

**Query Parameters:**
- `from_date` (required)
- `to_date` (required)
- `group_by` - day, week, month

**Response:** `200 OK`
```json
{
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-28T23:59:59Z"
  },
  "summary": {
    "total_orders": 543,
    "completed_orders": 512,
    "cancelled_orders": 31,
    "total_revenue": 15432.50,
    "average_order_value": 28.42,
    "average_rating": 4.5
  },
  "trends": [
    {
      "date": "2024-01-27",
      "orders": 45,
      "revenue": 1234.50,
      "average_order_value": 27.43
    }
  ]
}
```

---

## Delivery Agent APIs

### Agent Profile

#### GET /agents/me
Get delivery agent profile.

**Response:** `200 OK`
```json
{
  "agent_id": "agent_abc123",
  "email": "agent@example.com",
  "name": "Mike Wilson",
  "phone": "+1234567891",
  "vehicle_type": "bike",
  "vehicle_details": {
    "model": "Trek FX 3",
    "license_plate": null
  },
  "status": "online",
  "rating": 4.8,
  "total_deliveries": 1234,
  "region": "us-east-1",
  "current_location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "updated_at": "2024-01-28T11:45:00Z"
  },
  "is_verified": true,
  "joined_at": "2023-05-10T10:00:00Z"
}
```

#### PATCH /agents/me
Update agent profile.

**Request:**
```json
{
  "phone": "+1234567892",
  "vehicle_type": "scooter",
  "vehicle_details": {
    "model": "Honda Activa",
    "license_plate": "NY-1234"
  }
}
```

**Response:** `200 OK`

#### PATCH /agents/me/status
Update availability status.

**Request:**
```json
{
  "status": "online"
}
```

**Valid statuses:** `online`, `offline`, `busy`

**Response:** `200 OK`

#### POST /agents/me/location
Update current location.

**Request:**
```json
{
  "latitude": 40.7150,
  "longitude": -74.0050,
  "bearing": 45,
  "accuracy": 10
}
```

**Response:** `200 OK`

### Delivery Tasks

#### GET /agents/me/deliveries
List assigned deliveries.

**Query Parameters:**
- `status` - Filter by status (assigned, accepted, picked_up, delivered, rejected)
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "delivery_id": "del_abc123",
      "order_id": "ord_abc123",
      "order_number": "QB-2024-001234",
      "status": "assigned",
      "restaurant": {
        "restaurant_id": "rest_abc123",
        "name": "Pizza Palace",
        "phone": "+1234567890",
        "address": {
          "street": "789 Food Street",
          "city": "New York",
          "coordinates": {
            "latitude": 40.7204,
            "longitude": -74.0014
          }
        }
      },
      "customer": {
        "customer_id": "cust_abc123",
        "name": "John Doe",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "apartment": "Apt 4B",
          "city": "New York",
          "coordinates": {
            "latitude": 40.7128,
            "longitude": -74.0060
          }
        },
        "delivery_instructions": "Ring doorbell twice"
      },
      "route": {
        "distance_km": 2.3,
        "estimated_duration_minutes": 12
      },
      "payment_method": "online",
      "tip_amount": 3.00,
      "delivery_fee": 2.99,
      "assigned_at": "2024-01-28T11:25:00Z",
      "pickup_by": "2024-01-28T11:35:00Z",
      "deliver_by": "2024-01-28T12:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /agents/me/deliveries/{delivery_id}
Get delivery details.

#### POST /agents/me/deliveries/{delivery_id}/accept
Accept delivery task.

**Response:** `200 OK`
```json
{
  "delivery_id": "del_abc123",
  "status": "accepted",
  "accepted_at": "2024-01-28T11:26:00Z"
}
```

#### POST /agents/me/deliveries/{delivery_id}/reject
Reject delivery task.

**Request:**
```json
{
  "reason": "Too far from current location",
  "reason_code": "distance"
}
```

**Response:** `200 OK`

#### POST /agents/me/deliveries/{delivery_id}/pickup
Mark order picked up from restaurant.

**Request:**
```json
{
  "verification_code": "1234",
  "pickup_timestamp": "2024-01-28T11:30:00Z"
}
```

**Response:** `200 OK`

#### POST /agents/me/deliveries/{delivery_id}/deliver
Mark order delivered to customer.

**Request:**
```json
{
  "verification_code": "5678",
  "delivery_timestamp": "2024-01-28T11:55:00Z",
  "photo_url": "https://cdn.quickbite.com/proof/xyz789.jpg",
  "signature": "base64_signature_data",
  "notes": "Left at front door as requested"
}
```

**For Cash on Delivery:**
```json
{
  "verification_code": "5678",
  "delivery_timestamp": "2024-01-28T11:55:00Z",
  "cash_collected": 45.21,
  "photo_url": "https://cdn.quickbite.com/proof/xyz789.jpg"
}
```

**Response:** `200 OK`

#### GET /agents/me/deliveries/{delivery_id}/navigation
Get navigation details.

**Response:** `200 OK`
```json
{
  "delivery_id": "del_abc123",
  "current_destination": "restaurant",
  "destination": {
    "name": "Pizza Palace",
    "address": "789 Food Street, New York, NY 10001",
    "coordinates": {
      "latitude": 40.7204,
      "longitude": -74.0014
    },
    "phone": "+1234567890"
  },
  "route": {
    "distance_km": 1.5,
    "duration_minutes": 8,
    "polyline": "encoded_polyline_string"
  }
}
```

### Earnings

#### GET /agents/me/earnings/summary
Get earnings summary.

**Query Parameters:**
- `from_date`
- `to_date`

**Response:** `200 OK`
```json
{
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-28T23:59:59Z"
  },
  "summary": {
    "total_deliveries": 234,
    "total_earnings": 1234.50,
    "base_earnings": 1050.00,
    "tips": 184.50,
    "bonuses": 0.00,
    "average_per_delivery": 5.27
  },
  "daily_breakdown": [
    {
      "date": "2024-01-27",
      "deliveries": 12,
      "earnings": 63.00,
      "tips": 15.00
    }
  ]
}
```

#### GET /agents/me/earnings/transactions
List earning transactions.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "transaction_id": "txn_abc123",
      "type": "delivery",
      "amount": 5.27,
      "delivery_id": "del_abc123",
      "order_number": "QB-2024-001234",
      "breakdown": {
        "base": 3.50,
        "tip": 1.77,
        "bonus": 0.00
      },
      "created_at": "2024-01-28T11:55:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## Admin APIs

### Restaurant Management

#### GET /admin/restaurants
List all restaurants.

**Query Parameters:**
- `status` - Filter by status (active, inactive, suspended)
- `region` - Filter by region
- `search` - Search by name
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "restaurant_id": "rest_abc123",
      "name": "Pizza Palace",
      "owner": {
        "user_id": "user_owner123",
        "name": "Owner Name",
        "email": "owner@pizzapalace.com"
      },
      "status": "active",
      "region": "us-east-1",
      "total_orders": 5432,
      "rating": 4.5,
      "created_at": "2023-06-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /admin/restaurants/{restaurant_id}
Get restaurant details.

#### POST /admin/restaurants
Create new restaurant.

**Request:**
```json
{
  "name": "New Restaurant",
  "owner_email": "owner@newrestaurant.com",
  "cuisine_types": ["Mexican"],
  "phone": "+1234567890",
  "address": {
    "street": "123 Food St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "region": "us-east-1"
}
```

**Response:** `201 Created`

#### PATCH /admin/restaurants/{restaurant_id}
Update restaurant.

#### PATCH /admin/restaurants/{restaurant_id}/status
Update restaurant status.

**Request:**
```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

**Valid statuses:** `active`, `inactive`, `suspended`

**Response:** `200 OK`

### Delivery Agent Management

#### GET /admin/agents
List all delivery agents.

**Query Parameters:**
- `status` - Filter by status
- `region` - Filter by region
- `search` - Search by name
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "agent_id": "agent_abc123",
      "name": "Mike Wilson",
      "email": "agent@example.com",
      "phone": "+1234567891",
      "status": "online",
      "rating": 4.8,
      "total_deliveries": 1234,
      "region": "us-east-1",
      "created_at": "2023-05-10T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /admin/agents/{agent_id}
Get agent details.

#### POST /admin/agents
Create new delivery agent.

#### PATCH /admin/agents/{agent_id}/status
Update agent status.

**Request:**
```json
{
  "status": "suspended",
  "reason": "Multiple customer complaints"
}
```

**Response:** `200 OK`

### Order Management

#### GET /admin/orders
List all orders.

**Query Parameters:**
- `status` - Filter by status
- `restaurant_id` - Filter by restaurant
- `customer_id` - Filter by customer
- `agent_id` - Filter by agent
- `payment_method` - Filter by payment method
- `from_date`
- `to_date`
- `region`
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "order_id": "ord_abc123",
      "order_number": "QB-2024-001234",
      "status": "delivered",
      "restaurant": {
        "restaurant_id": "rest_abc123",
        "name": "Pizza Palace"
      },
      "customer": {
        "customer_id": "cust_abc123",
        "name": "John Doe"
      },
      "agent": {
        "agent_id": "agent_abc123",
        "name": "Mike Wilson"
      },
      "total": 45.21,
      "payment_method": "online",
      "payment_status": "captured",
      "region": "us-east-1",
      "created_at": "2024-01-28T11:00:00Z",
      "delivered_at": "2024-01-28T11:55:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /admin/orders/{order_id}
Get order details with full audit trail.

#### PATCH /admin/orders/{order_id}/reassign
Manually reassign delivery agent.

**Request:**
```json
{
  "agent_id": "agent_xyz789",
  "reason": "Original agent unavailable"
}
```

**Response:** `200 OK`

#### POST /admin/orders/{order_id}/resolve
Resolve order dispute.

**Request:**
```json
{
  "resolution": "refund",
  "refund_amount": 45.21,
  "notes": "Food quality issue - full refund issued"
}
```

**Response:** `200 OK`

### Payment Management

#### GET /admin/payments
List all payments.

**Query Parameters:**
- `status` - Filter by status
- `method` - Filter by payment method
- `from_date`
- `to_date`
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "payment_id": "pay_abc123",
      "order_id": "ord_abc123",
      "amount": 45.21,
      "method": "online",
      "status": "captured",
      "provider": "stripe",
      "provider_payment_id": "pi_abc123",
      "created_at": "2024-01-28T11:00:00Z",
      "captured_at": "2024-01-28T11:55:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /admin/payments/{payment_id}
Get payment details.

#### POST /admin/payments/{payment_id}/refund
Issue refund.

**Request:**
```json
{
  "amount": 45.21,
  "reason": "Order cancelled",
  "reason_code": "customer_request"
}
```

**Response:** `200 OK`
```json
{
  "refund_id": "ref_abc123",
  "payment_id": "pay_abc123",
  "amount": 45.21,
  "status": "pending",
  "estimated_at": "2024-01-30T11:00:00Z"
}
```

### Payout Management

#### GET /admin/payouts
List all restaurant payouts.

**Query Parameters:**
- `status` - Filter by status
- `restaurant_id` - Filter by restaurant
- `from_date`
- `to_date`
- `limit`
- `cursor`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "payout_id": "payout_abc123",
      "restaurant_id": "rest_abc123",
      "restaurant_name": "Pizza Palace",
      "amount": 2500.00,
      "status": "completed",
      "method": "bank_transfer",
      "initiated_at": "2024-01-14T10:00:00Z",
      "completed_at": "2024-01-15T10:00:00Z",
      "reference_number": "PAY-2024-001"
    }
  ],
  "pagination": {...}
}
```

#### POST /admin/payouts
Record new payout.

**Request:**
```json
{
  "restaurant_id": "rest_abc123",
  "amount": 2500.00,
  "method": "bank_transfer",
  "bank_account_id": "ba_abc123",
  "reference_number": "PAY-2024-002",
  "notes": "Weekly payout"
}
```

**Response:** `201 Created`

#### PATCH /admin/payouts/{payout_id}/status
Update payout status.

**Request:**
```json
{
  "status": "completed",
  "completed_at": "2024-01-15T10:00:00Z"
}
```

**Valid statuses:** `pending`, `processing`, `completed`, `failed`

**Response:** `200 OK`

### System Analytics

#### GET /admin/analytics/overview
Get system-wide analytics.

**Query Parameters:**
- `from_date` (required)
- `to_date` (required)
- `region` - Filter by region
- `group_by` - day, week, month

**Response:** `200 OK`
```json
{
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-28T23:59:59Z"
  },
  "summary": {
    "total_orders": 54321,
    "completed_orders": 51234,
    "cancelled_orders": 3087,
    "total_gmv": 1543210.50,
    "platform_revenue": 154321.05,
    "average_order_value": 28.42,
    "active_restaurants": 543,
    "active_agents": 234,
    "active_customers": 12345
  },
  "trends": [
    {
      "date": "2024-01-27",
      "orders": 2345,
      "gmv": 65432.10,
      "revenue": 6543.21
    }
  ],
  "by_region": [
    {
      "region": "us-east-1",
      "orders": 32145,
      "gmv": 912345.67
    },
    {
      "region": "us-west-1",
      "orders": 22176,
      "gmv": 630864.83
    }
  ]
}
```

#### GET /admin/analytics/restaurants
Restaurant performance analytics.

#### GET /admin/analytics/agents
Delivery agent performance analytics.

---

## Webhook Events

QuickBite can send webhook events to notify external systems of important events.

### Configuration

#### POST /admin/webhooks
Create webhook endpoint.

**Request:**
```json
{
  "url": "https://your-server.com/webhooks/quickbite",
  "events": [
    "order.created",
    "order.delivered",
    "payment.captured"
  ],
  "secret": "whsec_abc123"
}
```

**Response:** `201 Created`

#### GET /admin/webhooks
List webhook endpoints.

#### DELETE /admin/webhooks/{webhook_id}
Delete webhook endpoint.

### Webhook Payload Structure

All webhooks follow this structure:

```json
{
  "event_id": "evt_abc123",
  "event_type": "order.created",
  "created_at": "2024-01-28T11:00:00Z",
  "data": {
    // Event-specific data
  }
}
```

### Signature Verification

Webhooks include a signature header for verification:
```
X-QuickBite-Signature: t=1706437200,v1=abc123def456...
```

Verify using HMAC SHA-256 with your webhook secret.

### Event Types

#### Order Events
- `order.created` - New order placed
- `order.accepted` - Restaurant accepted order
- `order.rejected` - Restaurant rejected order
- `order.preparing` - Order preparation started
- `order.ready` - Order ready for pickup
- `order.picked_up` - Agent picked up order
- `order.delivered` - Order delivered
- `order.cancelled` - Order cancelled

#### Payment Events
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `refund.created` - Refund initiated
- `refund.completed` - Refund completed

#### Payout Events
- `payout.created` - Payout initiated
- `payout.completed` - Payout completed
- `payout.failed` - Payout failed

### Example Webhook Payloads

#### order.created
```json
{
  "event_id": "evt_abc123",
  "event_type": "order.created",
  "created_at": "2024-01-28T11:00:00Z",
  "data": {
    "order_id": "ord_abc123",
    "order_number": "QB-2024-001234",
    "restaurant_id": "rest_abc123",
    "customer_id": "cust_abc123",
    "total": 45.21,
    "payment_method": "online"
  }
}
```

#### payment.captured
```json
{
  "event_id": "evt_xyz789",
  "event_type": "payment.captured",
  "created_at": "2024-01-28T11:55:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "order_id": "ord_abc123",
    "amount": 45.21,
    "method": "online",
    "provider": "stripe"
  }
}
```

---

## Rate Limiting

All API endpoints are rate limited:

**Per User/Restaurant/Agent:**
- 100 requests per minute
- 10,000 requests per day

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706437260
```

**Response when rate limited:** `429 Too Many Requests`
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

---

## API Versioning

- Current version: v1
- Version specified in URL: `/v1/...`
- Breaking changes will result in new version
- Old versions supported for minimum 12 months after deprecation

---

## Testing

### Sandbox Environment
```
Base URL: https://api-sandbox.quickbite.com/v1
```

### Test Credentials
```
Customer: test-customer@quickbite.com / Test@123
Restaurant: test-restaurant@quickbite.com / Test@123
Agent: test-agent@quickbite.com / Test@123
Admin: test-admin@quickbite.com / Test@123
```

### Test Payment Methods
```
Card: 4242 4242 4242 4242
Exp: Any future date
CVV: Any 3 digits
```

---

## SDK & Libraries

Official SDKs available:
- JavaScript/TypeScript
- Python
- Java
- Ruby
- PHP
- Go

Installation:
```bash
npm install @quickbite/api-client
pip install quickbite-api
```

---

## Support

- API Documentation: https://docs.quickbite.com
- Developer Portal: https://developers.quickbite.com
- Support Email: api-support@quickbite.com
- Status Page: https://status.quickbite.com

---

## Changelog

### v1.0.0 (2024-01-28)
- Initial API release
- Customer, Restaurant, Delivery Agent, and Admin endpoints
- Authentication & Authorization
- Order management
- Payment processing
- Webhook support
