# API Schema Definitions & Reusable Components

This document defines reusable schema components and data models for the Quick-Bite Core Service API.

---

## Table of Contents
1. [User Schemas](#user-schemas)
2. [Authentication Schemas](#authentication-schemas)
3. [Restaurant Schemas](#restaurant-schemas)
4. [Branch Schemas](#branch-schemas)
5. [Product Schemas](#product-schemas)
6. [Address Schemas](#address-schemas)
7. [RBAC Schemas](#rbac-schemas)
8. [Error Schemas](#error-schemas)

---

## User Schemas

### User

**Description**: Represents a system user account

```typescript
interface User {
  id: number;
  email: string;
  phone: string;
  name: string;
  systemRole: 'customer' | 'restaurant_user' | 'delivery_agent' | 'system_admin';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

**YAML Schema**:
```yaml
User:
  type: object
  required:
    - id
    - email
    - phone
    - name
    - systemRole
    - createdAt
    - updatedAt
  properties:
    id:
      type: integer
      description: Unique user identifier
      example: 1
    email:
      type: string
      format: email
      description: User email address
      example: "user@example.com"
    phone:
      type: string
      description: 10-11 digit phone number
      example: "01012345678"
    name:
      type: string
      description: User's full name
      example: "John Doe"
    systemRole:
      type: string
      enum:
        - customer
        - restaurant_user
        - delivery_agent
        - system_admin
      description: System-level role
      example: "customer"
    createdAt:
      type: string
      format: date-time
      description: Account creation timestamp
      example: "2026-01-15T10:00:00Z"
    updatedAt:
      type: string
      format: date-time
      description: Last update timestamp
      example: "2026-04-11T15:30:00Z"
    deletedAt:
      type: string
      format: date-time
      nullable: true
      description: Soft delete timestamp
      example: null
```

**JSON Example**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "01012345678",
  "name": "John Doe",
  "systemRole": "customer",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-04-11T15:30:00Z",
  "deletedAt": null
}
```

### UserProfile

**Description**: User profile response (excludes sensitive fields)

```typescript
interface UserProfile {
  id: number;
  email: string;
  phone: string;
  name: string;
  systemRole: string;
}
```

---

## Authentication Schemas

### LoginRequest

```yaml
LoginRequest:
  type: object
  required:
    - email
    - password
  properties:
    email:
      type: string
      format: email
      example: "user@example.com"
    password:
      type: string
      format: password
      minLength: 8
      example: "SecurePass123"
```

### AuthResponse

```yaml
AuthResponse:
  type: object
  required:
    - id
    - email
    - name
    - systemRole
    - accessToken
    - refreshToken
  properties:
    id:
      type: integer
      example: 1
    email:
      type: string
      format: email
      example: "user@example.com"
    name:
      type: string
      example: "John Doe"
    systemRole:
      type: string
      enum:
        - customer
        - restaurant_user
        - delivery_agent
        - system_admin
      example: "customer"
    accessToken:
      type: string
      description: JWT access token (valid for 1 hour)
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    refreshToken:
      type: string
      description: JWT refresh token (valid for 7 days)
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### RegisterRequest

```yaml
RegisterRequest:
  type: object
  required:
    - email
    - phone
    - name
    - password
    - role
  properties:
    email:
      type: string
      format: email
      example: "user@example.com"
    phone:
      type: string
      minLength: 10
      maxLength: 11
      example: "01012345678"
    name:
      type: string
      minLength: 1
      example: "John Doe"
    password:
      type: string
      format: password
      minLength: 8
      description: "Min 8 chars, 1 lowercase, 1 uppercase, 1 number"
      example: "SecurePass123"
    role:
      type: string
      enum:
        - customer
        - restaurant_user
        - delivery_agent
      example: "customer"
    restaurant:
      type: object
      required:
        - name
        - primaryCountry
      properties:
        name:
          type: string
          example: "My Restaurant"
        primaryCountry:
          type: string
          example: "EG"
        logoURL:
          type: string
          format: uri
          example: "https://example.com/logo.png"
```

---

## Restaurant Schemas

### Restaurant

```yaml
Restaurant:
  type: object
  required:
    - id
    - name
    - primaryCountry
    - status
    - createdAt
  properties:
    id:
      type: integer
      example: 1
    name:
      type: string
      example: "Ahmed's Restaurant"
    primaryCountry:
      type: string
      description: ISO 3166-1 alpha-2 country code
      example: "EG"
    logoURL:
      type: string
      format: uri
      nullable: true
      example: "https://example.com/logo.png"
    status:
      type: string
      enum:
        - active
        - inactive
        - suspended
        - pending
      example: "active"
    createdAt:
      type: string
      format: date-time
      example: "2026-01-15T10:00:00Z"
```

### CreateRestaurantRequest

```yaml
CreateRestaurantRequest:
  type: object
  required:
    - owner
    - name
    - primaryCountry
  properties:
    owner:
      type: object
      required:
        - email
        - phone
        - name
        - password
      properties:
        email:
          type: string
          format: email
          example: "owner@example.com"
        phone:
          type: string
          minLength: 10
          maxLength: 11
          example: "01012345678"
        name:
          type: string
          example: "Ahmed Hassan"
        password:
          type: string
          format: password
          example: "SecurePass123"
    name:
      type: string
      example: "Ahmed's Restaurant"
    primaryCountry:
      type: string
      example: "EG"
    logoURL:
      type: string
      format: uri
      nullable: true
```

---

## Branch Schemas

### Branch

```yaml
Branch:
  type: object
  required:
    - id
    - restaurantId
    - label
    - lat
    - lng
    - opensAt
    - closesAt
    - currency
    - deliveryRadius
  properties:
    id:
      type: integer
      example: 1
    restaurantId:
      type: integer
      example: 1
    label:
      type: string
      example: "Downtown Branch"
    countryCode:
      type: string
      example: "EG"
    lat:
      type: number
      format: double
      minimum: -90
      maximum: 90
      example: 30.043304
    lng:
      type: number
      format: double
      minimum: -180
      maximum: 180
      example: 31.200782
    addressText:
      type: string
      example: "123 Main Street, Cairo"
    opensAt:
      type: string
      pattern: '^\d{2}:\d{2}$'
      example: "09:00"
    closesAt:
      type: string
      pattern: '^\d{2}:\d{2}$'
      example: "23:00"
    currency:
      type: string
      enum:
        - EGP
        - AED
        - SAR
        - JOD
        - LBP
      example: "EGP"
    deliveryRadius:
      type: integer
      minimum: 0
      description: Delivery radius in kilometers
      example: 5
    isActive:
      type: boolean
      example: true
    createdAt:
      type: string
      format: date-time
      example: "2026-01-15T10:00:00Z"
```

### CreateBranchRequest

```yaml
CreateBranchRequest:
  type: object
  required:
    - label
    - lat
    - lng
    - countryCode
    - addressText
    - opensAt
    - closesAt
    - currency
    - deliveryRadius
  properties:
    label:
      type: string
      minLength: 1
      example: "Downtown Branch"
    lat:
      type: number
      example: 30.043304
    lng:
      type: number
      example: 31.200782
    countryCode:
      type: string
      pattern: '^[A-Z]{2}$'
      example: "EG"
    addressText:
      type: string
      minLength: 1
      example: "123 Main Street, Cairo"
    opensAt:
      type: string
      pattern: '^\d{2}:\d{2}$'
      example: "09:00"
    closesAt:
      type: string
      pattern: '^\d{2}:\d{2}$'
      example: "23:00"
    currency:
      type: string
      enum:
        - EGP
        - AED
        - SAR
        - JOD
        - LBP
      example: "EGP"
    deliveryRadius:
      type: integer
      minimum: 0
      example: 5
```

---

## Product Schemas

### Product

```yaml
Product:
  type: object
  required:
    - id
    - name
    - restaurantId
  properties:
    id:
      type: integer
      example: 1
    restaurantId:
      type: integer
      example: 1
    name:
      type: string
      example: "Pasta Carbonara"
    description:
      type: string
      nullable: true
      example: "Classic Italian pasta with bacon and cream"
    imageUrl:
      type: string
      format: uri
      nullable: true
      example: "https://example.com/pasta.jpg"
    categoryName:
      type: string
      nullable: true
      example: "Main Course"
    createdAt:
      type: string
      format: date-time
      example: "2026-01-15T10:00:00Z"
```

### BranchProduct

```yaml
BranchProduct:
  type: object
  allOf:
    - $ref: '#/Product'
    - type: object
      properties:
        price:
          type: integer
          minimum: 0
          example: 150
        stock:
          type: integer
          minimum: 0
          example: 25
        isAvailable:
          type: boolean
          example: true
```

### CreateProductRequest

```yaml
CreateProductRequest:
  type: object
  required:
    - name
  properties:
    name:
      type: string
      minLength: 1
      example: "Pasta Carbonara"
    description:
      type: string
      nullable: true
      example: "Classic Italian pasta"
    imageUrl:
      type: string
      format: uri
      nullable: true
    categoryName:
      type: string
      nullable: true
      example: "Main Course"
```

---

## Address Schemas

### CustomerAddress

```yaml
CustomerAddress:
  type: object
  required:
    - id
    - label
    - country
    - city
    - street
    - type
    - lat
    - lng
    - isDefault
  properties:
    id:
      type: integer
      example: 1
    label:
      type: string
      example: "Home"
    country:
      type: string
      example: "Egypt"
    city:
      type: string
      example: "Cairo"
    street:
      type: string
      example: "Main Street"
    building:
      type: string
      nullable: true
      example: "123"
    apartmentNumber:
      type: string
      nullable: true
      example: "4A"
    type:
      type: string
      enum:
        - home
        - work
        - other
      example: "home"
    lat:
      type: number
      format: double
      example: 30.043304
    lng:
      type: number
      format: double
      example: 31.200782
    isDefault:
      type: boolean
      example: true
    createdAt:
      type: string
      format: date-time
      example: "2026-01-15T10:00:00Z"
```

### CreateAddressRequest

```yaml
CreateAddressRequest:
  type: object
  required:
    - label
    - country
    - city
    - street
    - type
    - lat
    - lng
    - isDefault
  properties:
    label:
      type: string
      minLength: 1
      example: "Home"
    country:
      type: string
      minLength: 1
      example: "Egypt"
    city:
      type: string
      minLength: 1
      example: "Cairo"
    street:
      type: string
      minLength: 1
      example: "Main Street"
    building:
      type: string
      nullable: true
      example: "123"
    apartmentNumber:
      type: string
      nullable: true
      example: "4A"
    type:
      type: string
      enum:
        - home
        - work
        - other
      example: "home"
    lat:
      type: number
      example: 30.043304
    lng:
      type: number
      example: 31.200782
    isDefault:
      type: boolean
      example: true
```

---

## RBAC Schemas

### Member

```yaml
Member:
  type: object
  required:
    - id
    - userId
    - restaurantId
    - roleId
    - status
  properties:
    id:
      type: integer
      example: 1
    userId:
      type: integer
      example: 2
    restaurantId:
      type: integer
      example: 1
    roleId:
      type: integer
      example: 3
    status:
      type: string
      enum:
        - active
        - inactive
        - suspended
      example: "active"
    createdAt:
      type: string
      format: date-time
      example: "2026-01-15T10:00:00Z"
    updatedAt:
      type: string
      format: date-time
      example: "2026-04-11T15:30:00Z"
```

### MemberDetails

```yaml
MemberDetails:
  type: object
  properties:
    id:
      type: integer
      example: 1
    userId:
      type: integer
      example: 2
    email:
      type: string
      format: email
      example: "member@example.com"
    name:
      type: string
      example: "Ali Ahmed"
    phone:
      type: string
      example: "01098765432"
    role:
      type: string
      example: "manager"
    roleDisplayName:
      type: string
      example: "Manager"
    status:
      type: string
      enum:
        - active
        - inactive
        - suspended
      example: "active"
```

### CreateMemberRequest

```yaml
CreateMemberRequest:
  type: object
  required:
    - email
    - name
    - phone
    - role
  properties:
    email:
      type: string
      format: email
      example: "member@example.com"
    name:
      type: string
      minLength: 1
      example: "Ali Ahmed"
    phone:
      type: string
      minLength: 10
      maxLength: 11
      example: "01098765432"
    role:
      type: string
      description: "Role name (cannot be 'owner')"
      example: "manager"
    branchIds:
      type: array
      items:
        type: integer
      nullable: true
      example: [1, 2]
```

### Role

```yaml
Role:
  type: object
  required:
    - name
    - displayName
    - permissions
  properties:
    name:
      type: string
      example: "manager"
    displayName:
      type: string
      example: "Manager"
    permissions:
      type: array
      items:
        type: object
        properties:
          resource:
            type: string
            example: "core:restaurant"
          actions:
            type: array
            items:
              type: string
            example:
              - read
              - update
```

---

## Error Schemas

### ErrorResponse

```yaml
ErrorResponse:
  type: object
  required:
    - error
  properties:
    error:
      type: string
      description: Error message
      example: "User with this email already exists"
```

### ValidationErrorResponse

```yaml
ValidationErrorResponse:
  type: object
  required:
    - error
  properties:
    error:
      type: string
      description: Validation error message
      example: "email must be a valid email"
    field:
      type: string
      description: Field that failed validation
      example: "email"
```

### PaginatedResponse

```yaml
PaginatedResponse:
  type: object
  required:
    - data
    - meta
  properties:
    data:
      type: array
      items: {}
      description: Array of resources
    meta:
      type: object
      required:
        - nextCursor
        - hasMore
        - count
      properties:
        nextCursor:
          type: string
          nullable: true
          description: Cursor value for fetching next page, null if no more results
          example: "2026-01-15T10:00:00Z"
        hasMore:
          type: boolean
          description: Indicates if there are more results available
          example: true
        count:
          type: integer
          description: Number of results in current page
          example: 20
```

---

## Enum Definitions

### SystemRole

```typescript
enum SystemRole {
  SYSTEM_ADMIN = 'system_admin',
  CUSTOMER = 'customer',
  RESTAURANT_USER = 'restaurant_user',
  DELIVERY_AGENT = 'delivery_agent'
}
```

### RestaurantStatus

```typescript
enum RestaurantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}
```

### MemberStatus

```typescript
enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}
```

### AddressType

```typescript
enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other'
}
```

### Currency

```typescript
enum Currency {
  EGP = 'EGP', // Egyptian Pound
  AED = 'AED', // UAE Dirham
  SAR = 'SAR', // Saudi Riyal
  JOD = 'JOD', // Jordanian Dinar
  LBP = 'LBP'  // Lebanese Pound
}
```

---

## Common Patterns

### Standard Success Response

```yaml
SuccessResponse:
  type: object
  properties:
    message:
      type: string
      example: "Operation successful"
    data:
      type: object
      description: Response payload (structure varies)
```

### Standard Paginated List Response

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "meta": {
    "nextCursor": "2026-01-15T10:00:00Z",
    "hasMore": true,
    "count": 20
  }
}
```

### Standard Single Resource Response

```json
{
  "id": 1,
  "name": "Resource Name",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

**End of Schema Definitions**

