# QuickBite API Documentation v1.0
**RESTful API with Explicit Type Definitions**

---

## Authentication & Authorization

### POST /auth/register

**Description:** Register a new user account

**Request Body Schema:**

```typescript
{
  email: string           // required, format: email, unique
  password: string        // required, min: 8 chars, must contain letter + number
  phone: string          // required, format: E.164 (e.g., "+1234567890")
  name: string           // required, max: 100 chars
  user_type: enum        // required, values: ["customer", "restaurant_owner", "delivery_agent"]
}
```

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `email` | `string` | ✓ | Valid email format, must be unique | User's email address |
| `password` | `string` | ✓ | Min 8 characters, must contain at least one letter and one number | Account password |
| `phone` | `string` | ✓ | E.164 format (e.g., "+1234567890") | Phone number with country code |
| `name` | `string` | ✓ | Max 100 characters | User's full name |
| `user_type` | `string` (enum) | ✓ | One of: `customer`, `restaurant_owner`, `delivery_agent` | Type of account to create |

**Response Schema (201 Created):**

```typescript
{
  user_id: string            // format: "usr_[a-z0-9]+"
  email: string              // format: email
  user_type: string          // enum: ["customer", "restaurant_owner", "delivery_agent"]
  access_token: string       // JWT token
  refresh_token: string      // JWT refresh token
  expires_in: integer        // seconds until token expiry
}
```

| Property | Type | Nullable | Description |
|----------|------|----------|-------------|
| `user_id` | `string` | no | Unique user identifier with prefix "usr_" |
| `email` | `string` | no | Registered email address |
| `user_type` | `string` (enum) | no | Account type: customer, restaurant_owner, or delivery_agent |
| `access_token` | `string` | no | JWT access token for authentication |
| `refresh_token` | `string` | no | JWT refresh token for obtaining new access tokens |
| `expires_in` | `integer` | no | Number of seconds until access_token expires (typically 3600) |

---

### POST /auth/login

**Description:** Authenticate user and obtain access tokens

**Request Body Schema:**

```typescript
{
  email: string        // required, format: email
  password: string     // required
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `email` | `string` | ✓ | User's email address |
| `password` | `string` | ✓ | User's password |

**Response Schema (200 OK):**

```typescript
{
  access_token: string       // JWT token
  refresh_token: string      // JWT refresh token  
  expires_in: integer        // seconds
  user: {
    user_id: string          // format: "usr_[a-z0-9]+"
    email: string            // format: email
    name: string             // max: 100 chars
    user_type: string        // enum
  }
}
```

| Property | Type | Nullable | Description |
|----------|------|----------|-------------|
| `access_token` | `string` | no | JWT access token for API authentication |
| `refresh_token` | `string` | no | JWT refresh token |
| `expires_in` | `integer` | no | Token expiry in seconds |
| `user` | `object` | no | User information object |
| `user.user_id` | `string` | no | Unique user identifier |
| `user.email` | `string` | no | User's email address |
| `user.name` | `string` | no | User's full name |
| `user.user_type` | `string` (enum) | no | One of: customer, restaurant_owner, delivery_agent |

---

## Customer APIs

### GET /customers/me

**Description:** Retrieve current authenticated customer's profile

**Authentication:** Required (Bearer token)

**Response Schema (200 OK):**

```typescript
{
  customer_id: string                    // format: "cust_[a-z0-9]+"
  email: string                          // format: email
  name: string                           // max: 100 chars
  phone: string                          // format: E.164
  created_at: string                     // format: ISO 8601 datetime (UTC)
  default_address: {                     // nullable
    address_id: string                   // format: "addr_[a-z0-9]+"
    street: string                       // max: 200 chars
    apartment: string | null             // max: 50 chars
    city: string                         // max: 100 chars
    state: string                        // length: 2 (US state code)
    zip: string                          // length: 5-10
    coordinates: {
      latitude: number                   // range: -90 to 90, precision: 6 decimals
      longitude: number                  // range: -180 to 180, precision: 6 decimals
    }
  } | null
}
```

| Property | Type | Nullable | Constraints | Description |
|----------|------|----------|-------------|-------------|
| `customer_id` | `string` | no | Pattern: `^cust_[a-z0-9]+$` | Unique customer identifier |
| `email` | `string` | no | Valid email format | Customer's email address |
| `name` | `string` | no | Max 100 characters | Customer's full name |
| `phone` | `string` | no | E.164 format | Phone number with country code |
| `created_at` | `string` (datetime) | no | ISO 8601 format (UTC) | Account creation timestamp |
| `default_address` | `object` | **yes** | - | Default delivery address (null if not set) |
| `default_address.address_id` | `string` | no | Pattern: `^addr_[a-z0-9]+$` | Address identifier |
| `default_address.street` | `string` | no | Max 200 characters | Street address |
| `default_address.apartment` | `string` | **yes** | Max 50 characters | Apartment/suite number |
| `default_address.city` | `string` | no | Max 100 characters | City name |
| `default_address.state` | `string` | no | Exactly 2 characters | US state code (e.g., "NY") |
| `default_address.zip` | `string` | no | 5-10 characters | Postal code |
| `default_address.coordinates` | `object` | no | - | Geographic coordinates |
| `default_address.coordinates.latitude` | `number` (float) | no | Min: -90, Max: 90 | Latitude coordinate |
| `default_address.coordinates.longitude` | `number` (float) | no | Min: -180, Max: 180 | Longitude coordinate |

---

### PATCH /customers/me

**Description:** Update customer profile information

**Authentication:** Required

**Request Body Schema:**

```typescript
{
  name?: string        // optional, max: 100 chars
  phone?: string       // optional, format: E.164
}
```

| Property | Type | Required | Constraints | Description |
|----------|------|----------|-------------|-------------|
| `name` | `string` | no | Max 100 characters | Updated full name |
| `phone` | `string` | no | E.164 format (e.g., "+1234567890") | Updated phone number |

**Response Schema (200 OK):**
Returns the complete updated customer profile (same schema as GET /customers/me)

---

### GET /restaurants

**Description:** Search and browse nearby restaurants

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `latitude` | `number` (float) | ✓* | Range: -90 to 90 | User's current latitude |
| `longitude` | `number` (float) | ✓* | Range: -180 to 180 | User's current longitude |
| `cuisine` | `string` | no | Comma-separated | Filter by cuisine types (e.g., "italian,pizza") |
| `min_rating` | `number` (float) | no | Range: 0 to 5 | Minimum restaurant rating |
| `delivery_time_max` | `integer` | no | Min: 1 | Maximum delivery time in minutes |
| `min_order` | `number` (decimal) | no | Min: 0 | Maximum acceptable minimum order amount |
| `search` | `string` | no | Max 100 characters | Search query for restaurant name |
| `is_open` | `boolean` | no | - | Filter by currently open status |
| `limit` | `integer` | no | Min: 1, Max: 100, Default: 20 | Results per page |
| `cursor` | `string` | no | Opaque string | Pagination cursor for next page |

*Required together for location-based search

**Response Schema (200 OK):**

```typescript
{
  data: Array<{
    restaurant_id: string              // format: "rest_[a-z0-9]+"
    name: string                       // max: 100 chars
    slug: string                       // format: kebab-case
    cuisine_types: string[]            // array of strings, min: 1
    rating: number | null              // range: 0-5, precision: 1 decimal
    review_count: integer              // min: 0
    price_range: string                // enum: ["$", "$$", "$$$", "$$$$"]
    image_url: string | null           // format: URL
    estimated_delivery_time: integer   // minutes, min: 1
    minimum_order: number              // decimal(10,2), min: 0
    delivery_fee: number               // decimal(10,2), min: 0
    is_open: boolean
    distance_km: number | null         // precision: 1 decimal
    address: {
      street: string
      city: string
      state: string                    // length: 2
      zip: string                      // length: 5-10
    }
    operating_hours: {
      [day: string]: {                 // keys: monday, tuesday, etc.
        open: string                   // format: "HH:MM" (24-hour)
        close: string                  // format: "HH:MM" (24-hour)
      } | null                         // null if closed that day
    }
  }>
  pagination: {
    next_cursor: string | null         // null on last page
    has_more: boolean
    total_count: integer | null        // may be null for performance
  }
}
```

**Detailed Response Field Types:**

| Property Path | Type | Nullable | Constraints | Description |
|--------------|------|----------|-------------|-------------|
| `data` | `array` | no | - | Array of restaurant objects |
| `data[].restaurant_id` | `string` | no | Pattern: `^rest_[a-z0-9]+$` | Unique restaurant identifier |
| `data[].name` | `string` | no | Max 100 characters | Restaurant name |
| `data[].slug` | `string` | no | Pattern: `^[a-z0-9-]+$` | URL-friendly identifier |
| `data[].cuisine_types` | `array<string>` | no | Min 1 item | List of cuisine types |
| `data[].rating` | `number` (float) | **yes** | Range: 0-5, 1 decimal | Average customer rating (null if no reviews) |
| `data[].review_count` | `integer` | no | Min: 0 | Total number of reviews |
| `data[].price_range` | `string` (enum) | no | One of: "$", "$$", "$$$", "$$$$" | Price indicator |
| `data[].image_url` | `string` | **yes** | Valid URL format | Restaurant cover image URL |
| `data[].estimated_delivery_time` | `integer` | no | Min: 1 | Estimated delivery time in minutes |
| `data[].minimum_order` | `number` (decimal) | no | decimal(10,2), Min: 0 | Minimum order amount required |
| `data[].delivery_fee` | `number` (decimal) | no | decimal(10,2), Min: 0 | Delivery fee charged |
| `data[].is_open` | `boolean` | no | - | Whether restaurant is currently accepting orders |
| `data[].distance_km` | `number` (float) | **yes** | Min: 0, 1 decimal | Distance from user in kilometers |
| `data[].address` | `object` | no | - | Restaurant physical address |
| `data[].address.street` | `string` | no | Max 200 characters | Street address |
| `data[].address.city` | `string` | no | Max 100 characters | City name |
| `data[].address.state` | `string` | no | Length: 2 | US state code |
| `data[].address.zip` | `string` | no | Length: 5-10 | Postal code |
| `data[].operating_hours` | `object` | no | - | Weekly operating hours |
| `data[].operating_hours[day]` | `object` | **yes** | Keys: monday-sunday | Hours for specific day (null if closed) |
| `data[].operating_hours[day].open` | `string` | no | Format: "HH:MM" | Opening time (24-hour format) |
| `data[].operating_hours[day].close` | `string` | no | Format: "HH:MM" | Closing time (24-hour format) |
| `pagination` | `object` | no | - | Pagination metadata |
| `pagination.next_cursor` | `string` | **yes** | Opaque string | Cursor for next page (null on last page) |
| `pagination.has_more` | `boolean` | no | - | Whether more results exist |
| `pagination.total_count` | `integer` | **yes** | Min: 0 | Total count (may be null for performance) |

---

### POST /orders

**Description:** Create a new order from the current shopping cart

**Authentication:** Required

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Idempotency-Key` | `string` | Recommended | UUID v4 format recommended, prevents duplicate orders |

**Request Body Schema:**

```typescript
{
  delivery_address_id: string           // required, format: "addr_[a-z0-9]+"
  delivery_instructions: string         // optional, max: 500 chars
  payment_method: enum                  // required, values: ["online", "cod"]
  payment_details?: {                   // required if payment_method="online"
    payment_method_id: string           // format: "pm_[a-z0-9]+"
  }
  scheduled_delivery: string | null     // optional, format: ISO 8601, must be future
  tip_amount: number                    // optional, decimal(10,2), min: 0, default: 0
  notes: string                         // optional, max: 1000 chars
}
```

| Property | Type | Required | Constraints | Description |
|----------|------|----------|-------------|-------------|
| `delivery_address_id` | `string` | ✓ | Pattern: `^addr_[a-z0-9]+$`, must belong to customer | Address ID for delivery |
| `delivery_instructions` | `string` | no | Max 500 characters | Special delivery instructions |
| `payment_method` | `string` (enum) | ✓ | One of: `online`, `cod` | Payment method selection |
| `payment_details` | `object` | Conditional | Required if payment_method is "online" | Payment information |
| `payment_details.payment_method_id` | `string` | ✓ | Pattern: `^pm_[a-z0-9]+$` | Saved payment method ID |
| `scheduled_delivery` | `string` (datetime) | no | ISO 8601 format, must be future datetime, within restaurant hours | Scheduled delivery time (null for ASAP) |
| `tip_amount` | `number` (decimal) | no | decimal(10,2), Min: 0, Default: 0 | Tip amount for delivery agent |
| `notes` | `string` | no | Max 1000 characters | Additional order notes |

**Response Schema (201 Created):**

```typescript
{
  order_id: string                      // format: "ord_[a-z0-9]+"
  order_number: string                  // format: "QB-YYYY-NNNNNN"
  status: enum                          // values: see Order Status table
  restaurant: {
    restaurant_id: string               // format: "rest_[a-z0-9]+"
    name: string
    phone: string                       // format: E.164
  }
  items: Array<{
    item_id: string                     // format: "item_[a-z0-9]+"
    name: string
    quantity: integer                   // range: 1-99
    unit_price: number                  // decimal(10,2)
    customizations: Array<{
      customization_id: string
      name: string
      selected_option: {
        option_id: string
        name: string
        price_modifier: number          // decimal(10,2), can be negative
      }
    }>
    subtotal: number                    // decimal(10,2)
  }>
  delivery_address: {
    street: string
    apartment: string | null
    city: string
    state: string
    zip: string
  }
  pricing: {
    subtotal: number                    // decimal(10,2)
    delivery_fee: number                // decimal(10,2)
    tax: number                         // decimal(10,2)
    tip: number                         // decimal(10,2)
    total: number                       // decimal(10,2)
  }
  payment: {
    method: enum                        // values: ["online", "cod"]
    status: enum                        // values: see Payment Status table
    payment_id: string | null           // format: "pay_[a-z0-9]+"
  }
  estimated_delivery_time: string       // format: ISO 8601 datetime
  created_at: string                    // format: ISO 8601 datetime
}
```

**Order Status Enum:**

| Value | Type | Description |
|-------|------|-------------|
| `pending_restaurant` | `string` | Order placed, waiting for restaurant acceptance |
| `accepted` | `string` | Restaurant has accepted the order |
| `preparing` | `string` | Order is being prepared |
| `ready_for_pickup` | `string` | Order is ready for delivery agent pickup |
| `picked_up` | `string` | Delivery agent has picked up the order |
| `out_for_delivery` | `string` | Order is on the way to customer |
| `delivered` | `string` | Order successfully delivered |
| `cancelled` | `string` | Order was cancelled |
| `rejected` | `string` | Restaurant rejected the order |

**Payment Status Enum:**

| Value | Type | Description |
|-------|------|-------------|
| `pending` | `string` | Payment not yet processed |
| `authorized` | `string` | Payment authorized but not captured |
| `captured` | `string` | Payment successfully captured (completed) |
| `failed` | `string` | Payment failed |
| `refunded` | `string` | Payment has been refunded |

---

## Common Data Types Reference

### Standard Type Formats

| Type Name | Underlying Type | Format | Example | Description |
|-----------|----------------|--------|---------|-------------|
| `string` | string | UTF-8 | "Pizza Palace" | Standard text string |
| `integer` | number | int32 | 42 | 32-bit integer |
| `number` | number | float/double | 12.99 | Floating point number |
| `decimal(p,s)` | number | decimal | 12.99 | Fixed decimal (p=precision, s=scale) |
| `boolean` | boolean | true/false | true | Boolean value |
| `datetime` | string | ISO 8601 | "2024-01-28T11:00:00Z" | UTC datetime |
| `date` | string | ISO 8601 | "2024-01-28" | Date only (no time) |
| `email` | string | RFC 5322 | "user@example.com" | Email address |
| `phone` | string | E.164 | "+1234567890" | Phone with country code |
| `url` | string | RFC 3986 | "https://example.com" | URL |
| `enum` | string | - | "online" | String from fixed set of values |
| `array<T>` | array | - | ["A", "B"] | Array of type T |
| `object` | object | - | {"key": "value"} | JSON object |

### ID Format Patterns

| Resource | Prefix | Pattern | Example |
|----------|--------|---------|---------|
| User | `usr_` | `^usr_[a-z0-9]+$` | usr_abc123 |
| Customer | `cust_` | `^cust_[a-z0-9]+$` | cust_abc123 |
| Restaurant | `rest_` | `^rest_[a-z0-9]+$` | rest_abc123 |
| Order | `ord_` | `^ord_[a-z0-9]+$` | ord_abc123 |
| Item | `item_` | `^item_[a-z0-9]+$` | item_xyz789 |
| Agent | `agent_` | `^agent_[a-z0-9]+$` | agent_abc123 |
| Payment | `pay_` | `^pay_[a-z0-9]+$` | pay_abc123 |
| Address | `addr_` | `^addr_[a-z0-9]+$` | addr_xyz789 |

---

**Document Version**: 1.0.0  
**Last Updated**: January 28, 2024  
**API Version**: v1
