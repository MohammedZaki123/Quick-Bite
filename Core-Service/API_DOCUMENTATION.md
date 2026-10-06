# Quick-Bite Core Service API Documentation

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Resource Endpoints](#resource-endpoints)
   - [Health Check](#health-check)
   - [Authentication](#auth-endpoints)
   - [Users](#users-endpoints)
   - [Restaurants](#restaurants-endpoints)
   - [Restaurant Branches](#branches-endpoints)
   - [Products & Categories](#products-endpoints)
   - [Customer Addresses](#customer-addresses-endpoints)
   - [RBAC - Members & Roles](#rbac-endpoints)
5. [Pagination & Filtering](#pagination--filtering)
6. [Validation Rules](#validation-rules)
7. [Security Considerations](#security-considerations)
8. [Versioning & Deprecation](#versioning--deprecation)
9. [Change Log](#change-log)
10. [Common Use Cases](#common-use-cases)
11. [Quick Reference](#quick-reference)

---

## Overview

### Purpose
The Quick-Bite Core Service provides a RESTful API for managing restaurant operations, including user authentication, restaurant management, menu/product management, member access control, and customer address management.

### Base URL
```
http://localhost:3000/api
```

### API Versioning
- **Current Version**: v1 (implicit, no version prefix in endpoints)
- **Versioning Strategy**: Semantic versioning with backward compatibility maintained
- **Future**: v2, v3, etc., will be prefixed as `/api/v2/`, `/api/v3/`

### Authentication Method
- **Type**: JWT (JSON Web Tokens)
- **Token Location**: HTTP-only Cookies (`access_token` and `refresh_token`)
- **Additional**: Custom `X-Correlation-ID` header for request tracing
- **Token Expiry**: 
  - Access Token: 1 hour
  - Refresh Token: 7 days (configurable)

### Supported Content Type
```
Content-Type: application/json
Accept: application/json
```

### Base Response Structure
All successful responses follow this format:
```json
{
  "data": {},
  "message": "Success message"
}
```

Error responses:
```json
{
  "error": "Error message"
}
```

---

## Authentication

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Summary**: Register a new user account (customer, restaurant user, or delivery agent)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "01012345678",
  "name": "John Doe",
  "password": "SecurePass123",
  "role": "customer",
  "restaurant": {
    "name": "My Restaurant",
    "primaryCountry": "EG",
    "logoURL": "https://example.com/logo.png"
  }
}
```

**Field Requirements**:
- `email`: Valid email address (required)
- `phone`: 10-11 digit phone number (required)
- `name`: Non-empty string (required)
- `password`: Minimum 8 characters, 1 lowercase, 1 uppercase, 1 number (required)
- `role`: Enum - `customer`, `restaurant_user`, `delivery_agent` (required)
- `restaurant`: Object containing restaurant details (optional, only for `restaurant_user` role)

**Response** (201 Created):
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "01012345678",
  "name": "John Doe",
  "systemRole": "customer",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Status Codes**:
- `201`: User created successfully
- `400`: Validation failed (invalid email, weak password, etc.)
- `409`: Email or phone already exists

**Error Examples**:
```json
{
  "error": "User with this email already exists"
}
```

---

### 2. User Login

**Endpoint**: `POST /auth/login`

**Summary**: Authenticate user and obtain access/refresh tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "systemRole": "customer",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Set-Cookie Headers**:
```
Set-Cookie: access_token=eyJhbGc...; HttpOnly; Secure; Max-Age=3600
Set-Cookie: refresh_token=eyJhbGc...; HttpOnly; Secure; Max-Age=604800
```

**Status Codes**:
- `200`: Login successful
- `400`: Missing required fields
- `401`: Invalid credentials

---

### 3. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Summary**: Obtain a new access token using refresh token

**Request Headers**:
```
Cookie: refresh_token=eyJhbGc...
Content-Type: application/json
```

**Request Body**: Empty or can include refresh_token explicitly

**Response** (200 OK):
```json
{
  "message": "success"
}
```

**Set-Cookie Headers**:
```
Set-Cookie: access_token=NEW_TOKEN...; HttpOnly; Secure; Max-Age=3600
```

**Status Codes**:
- `200`: Token refreshed successfully
- `401`: Invalid or expired refresh token
- `403`: Refresh token not found

---

### 4. Forgot Password

**Endpoint**: `POST /auth/forget-password`

**Summary**: Request password reset OTP via email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "If an account with the provided email exists, a password reset OTP has been sent."
}
```

**Status Codes**:
- `200`: OTP sent (or message for non-existent email for security)
- `400`: Invalid email format

**Security Note**: Response is the same for existing and non-existing emails to prevent email enumeration.

---

### 5. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Summary**: Reset password using OTP received via email

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Field Requirements**:
- `otp`: 6-digit code sent to email
- `newPassword`: Must meet same requirements as registration password

**Response** (200 OK):
```json
{
  "message": "Password reset successfully, please login again"
}
```

**Status Codes**:
- `200`: Password reset successfully
- `400`: Invalid OTP or validation failed
- `401`: OTP expired

---

### 6. Accept Invitation

**Endpoint**: `POST /auth/accept-invite`

**Summary**: Accept team invitation and set password for new member account

**Request Body**:
```json
{
  "email": "newmember@example.com",
  "otp": "123456",
  "newPassword": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "message": "Invitation accepted successfully, please login again"
}
```

**Status Codes**:
- `200`: Invitation accepted
- `400`: Invalid OTP
- `404`: Member account not found

---

## Error Handling

### Error Response Format
```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | OK - Request succeeded | GET request successful |
| 201 | Created - Resource created | POST for new resource |
| 400 | Bad Request - Invalid input | Missing required fields |
| 401 | Unauthorized - Authentication failed | Invalid/expired token |
| 403 | Forbidden - Access denied | Insufficient permissions |
| 404 | Not Found - Resource doesn't exist | Invalid ID |
| 409 | Conflict - Resource already exists | Duplicate email |
| 422 | Unprocessable Entity - Validation failed | Invalid data types |
| 500 | Internal Server Error | Unexpected server error |

### Validation Error Examples

**Example 1: Missing Required Field**
```json
{
  "error": "field 'email' is required"
}
```

**Example 2: Invalid Email Format**
```json
{
  "error": "email must be a valid email"
}
```

**Example 3: Weak Password**
```json
{
  "error": "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number"
}
```

### Business Logic Error Examples

**Example 1: Duplicate Email**
```json
{
  "error": "User with this email already exists"
}
```

**Example 2: Resource Not Found**
```json
{
  "error": "Restaurant not found"
}
```

**Example 3: Unauthorized Action**
```json
{
  "error": "You don't have permission to perform this action"
}
```

### Correlation ID for Debugging
Every request/response includes a `X-Correlation-ID` header for tracing:

**Request Header**:
```
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

Use this ID when reporting issues to support.

---

## Resource Endpoints

### Health Check

#### GET /health

**Summary**: Check API server health status

**Request**: No authentication required

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

---

### Users Endpoints

#### 1. GET /users/me

**Summary**: Get current authenticated user information

**Authentication**: Required (Bearer Token or Cookie)

**Request Headers**:
```
Cookie: access_token=eyJhbGc...
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "01012345678",
  "name": "John Doe",
  "systemRole": "customer"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized/Token expired
- `404`: User not found

---

#### 2. PATCH /users/me

**Summary**: Update current user information

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Jane Doe",
  "phone": "01098765432"
}
```

**Field Constraints**:
- `name`: Optional, non-empty string
- `phone`: Optional, 10-11 digits

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "01098765432",
  "name": "Jane Doe",
  "systemRole": "customer"
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Invalid input
- `401`: Unauthorized
- `409`: Phone already in use

---

### Restaurants Endpoints

#### 1. GET /restaurant

**Summary**: Get all restaurants (public listing)

**Authentication**: Not required

**Query Parameters**:
```
?status=active&limit=20&cursor=&sortBy=createdAt&sortOrder=desc
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Restaurant A",
      "primaryCountry": "EG",
      "logoURL": "https://example.com/logo.png",
      "status": "active",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "nextCursor": "2026-01-16T10:00:00Z",
    "hasMore": true,
    "count": 20
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid query parameters

---

#### 2. POST /restaurant

**Summary**: Create a new restaurant (Admin/Owner only)

**Authentication**: Required

**Authorization**: System admin or new restaurant owner

**Request Body**:
```json
{
  "owner": {
    "email": "owner@example.com",
    "phone": "01012345678",
    "name": "Owner Name",
    "password": "SecurePass123"
  },
  "name": "Restaurant Name",
  "primaryCountry": "EG",
  "logoURL": "https://example.com/logo.png"
}
```

**Field Requirements**:
- `owner`: Nested object with user details
- `name`: Non-empty string
- `primaryCountry`: ISO 3166-1 alpha-2 country code
- `logoURL`: Optional URL

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Restaurant Name",
  "primaryCountry": "EG",
  "logoURL": "https://example.com/logo.png",
  "status": "pending",
  "createdAt": "2026-04-11T10:00:00Z"
}
```

**Status Codes**:
- `201`: Restaurant created
- `400`: Invalid input
- `401`: Unauthorized
- `409`: Owner email already exists

---

#### 3. GET /restaurant/:id

**Summary**: Get specific restaurant details

**Authentication**: Not required

**Path Parameters**:
- `id` (number): Restaurant ID

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Restaurant Name",
  "primaryCountry": "EG",
  "logoURL": "https://example.com/logo.png",
  "status": "active",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

**Status Codes**:
- `200`: Success
- `404`: Restaurant not found

---

#### 4. PATCH /restaurant/:id

**Summary**: Update restaurant details

**Authentication**: Required

**Authorization**: Restaurant owner/member with update permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('id')`: Verify user is member of restaurant
- `rbac({resource: 'core:restaurant', action: 'update', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `id` (number): Restaurant ID

**Request Body**:
```json
{
  "name": "Updated Restaurant Name",
  "primaryCountry": "AE",
  "logoURL": "https://example.com/new-logo.png"
}
```

**Field Constraints**: All fields are optional

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated Restaurant Name",
  "primaryCountry": "AE",
  "logoURL": "https://example.com/new-logo.png",
  "status": "active"
}
```

**Status Codes**:
- `200`: Updated successfully
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found

---

#### 5. PATCH /restaurant/:id/status

**Summary**: Update restaurant status (activate/suspend)

**Authentication**: Required

**Path Parameters**:
- `id` (number): Restaurant ID

**Request Body**:
```json
{
  "status": "active"
}
```

**Valid Status Values**: `active`, `inactive`, `suspended`

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Restaurant Name",
  "status": "active"
}
```

**Status Codes**:
- `200`: Status updated
- `400`: Invalid status value
- `401`: Unauthorized
- `404`: Restaurant not found

---

### Branches Endpoints

#### 1. GET /branches/nearby

**Summary**: Find branches near provided coordinates

**Authentication**: Not required

**Query Parameters**:
```
?lat=30.043304&lng=31.200782&radius=5
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "label": "Downtown Branch",
      "countryCode": "EG",
      "lat": 30.043304,
      "lng": 31.200782,
      "addressText": "123 Main Street, Cairo",
      "opensAt": "09:00",
      "closesAt": "23:00",
      "currency": "EGP",
      "deliveryRadius": 5,
      "isActive": true
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid coordinates

---

#### 2. POST /restaurants/:restaurantId/branches

**Summary**: Create a new branch for a restaurant

**Authentication**: Required

**Authorization**: Restaurant member  with create permission (owner) or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify user is member
- `rbac({resource: 'core:branch', action: 'create', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Request Body**:
```json
{
  "label": "Downtown Branch",
  "countryCode": "EG",
  "lat": 30.043304,
  "lng": 31.200782,
  "addressText": "123 Main Street, Cairo",
  "opensAt": "09:00",
  "closesAt": "23:00",
  "currency": "EGP",
  "deliveryRadius": 5
}
```

**Field Requirements**:
- `label`: Non-empty string
- `countryCode`: ISO 3166-1 alpha-2 country code
- `lat`, `lng`: Valid geographic coordinates
- `addressText`: Non-empty string
- `opensAt`, `closesAt`: Time in HH:MM format
- `currency`: Currency code (EGP, AED, SAR, etc.)
- `deliveryRadius`: Non-negative integer (kilometers)

**Response** (201 Created):
```json
{
  "id": 1,
  "restaurantId": 1,
  "label": "Downtown Branch",
  "countryCode": "EG",
  "lat": 30.043304,
  "lng": 31.200782,
  "addressText": "123 Main Street, Cairo",
  "opensAt": "09:00",
  "closesAt": "23:00",
  "currency": "EGP",
  "deliveryRadius": 5,
  "isActive": true,
  "createdAt": "2026-04-11T10:00:00Z"
}
```

**Status Codes**:
- `201`: Branch created
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found

---

#### 3. GET /restaurants/:restaurantId/branches

**Summary**: Get all branches for a restaurant

**Authentication**: Not required

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Query Parameters**:
```
?isActive=true&limit=20&cursor=&sortBy=createdAt&sortOrder=desc
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "label": "Downtown Branch",
      "lat": 30.043304,
      "lng": 31.200782,
      "opensAt": "09:00",
      "closesAt": "23:00",
      "isActive": true
    }
  ],
  "meta": {
    "nextCursor": "2026-01-15T10:00:00Z",
    "hasMore": true,
    "count": 1
  }
}
```

**Status Codes**:
- `200`: Success
- `404`: Restaurant not found

---

#### 4. PATCH /branches/:id

**Summary**: Update branch details

**Authentication**: Required

**Authorization**: User with access to this branch or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireBranchAccess('id')`: Verify user has access
- `rbac({resource: 'core:branch', action: 'update', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `id` (number): Branch ID

**Request Body**:
```json
{
  "label": "Updated Branch Name",
  "lat": 30.050000,
  "lng": 31.205000,
  "opensAt": "10:00",
  "closesAt": "22:00"
}
```

**Field Constraints**: All fields are optional

**Note**: When updating location fields (lat, lng, country, label, addressText), all location fields must be provided together

**Response** (200 OK):
```json
{
  "id": 1,
  "label": "Updated Branch Name",
  "lat": 30.050000,
  "lng": 31.205000,
  "opensAt": "10:00",
  "closesAt": "22:00"
}
```

**Status Codes**:
- `200`: Updated successfully
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Branch not found

---

#### 5. PATCH /branches/:id/status

**Summary**: Activate/deactivate a branch

**Authentication**: Required

**Path Parameters**:
- `id` (number): Branch ID

**Request Body**:
```json
{
  "isActive": true,
  "commission": 4
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "isActive": true
}
```

**Status Codes**:
- `200`: Status updated
- `401`: Unauthorized
- `404`: Branch not found

---

### Products Endpoints

#### 1. GET /restaurants/:restaurantId/categories

**Summary**: Get all product categories for a restaurant

**Authentication**: Not required

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Appetizers",
      "description": "Starter dishes"
    },
    {
      "id": 2,
      "name": "Main Course",
      "description": "Main dishes"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `404`: Restaurant not found

---

#### 2. GET /restaurants/:restaurantId/products

**Summary**: Get products for a restaurant (admin view with all details)

**Authentication**: Required

**Authorization**: Restaurant member with read permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:product', action: 'read', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Query Parameters**:
```
?categoryId=1&limit=20&cursor=&sortBy=createdAt&sortOrder=desc&isAvailable=true
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Pasta Carbonara",
      "description": "Classic Italian pasta",
      "imageUrl": "https://example.com/pasta.jpg",
      "categoryName": "Main Course",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "nextCursor": "2026-01-16T10:00:00Z",
    "hasMore": true,
    "count": 1
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found

---

#### 3. GET /branches/:branchId/products

**Summary**: Get products available at a specific branch (customer view)

**Authentication**: Not required

**Path Parameters**:
- `branchId` (number): Branch ID

**Query Parameters**:
```
?categoryId=1&limit=20&cursor=&sortBy=createdAt&sortOrder=desc
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Pasta Carbonara",
      "price": 150,
      "stock": 25,
      "isAvailable": true,
      "imageUrl": "https://example.com/pasta.jpg"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `404`: Branch not found

---

#### 4. GET /products/:id

**Summary**: Get single product details

**Authentication**: Not required

**Path Parameters**:
- `id` (number): Product ID

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "imageUrl": "https://example.com/pasta.jpg",
  "categoryName": "Main Course"
}
```

**Status Codes**:
- `200`: Success
- `404`: Product not found

---

#### 5. POST /restaurants/:restaurantId/products

**Summary**: Create a new product for a restaurant

**Authentication**: Required

**Authorization**: Restaurant member with create permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:product', action: 'create', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Request Body**:
```json
{
  "name": "Pasta Carbonara",
  "description": "Classic Italian pasta with bacon and cream",
  "imageUrl": "https://example.com/pasta.jpg",
  "categoryName": "Main Course"
}
```

**Field Requirements**:
- `name`: Non-empty string (required)
- `description`: Optional string
- `imageUrl`: Optional URL
- `categoryName`: Optional string (category name or ID)

**Response** (201 Created):
```json
{
  "id": 1,
  "restaurantId": 1,
  "name": "Pasta Carbonara",
  "description": "Classic Italian pasta with bacon and cream",
  "imageUrl": "https://example.com/pasta.jpg",
  "categoryName": "Main Course",
  "createdAt": "2026-04-11T10:00:00Z"
}
```

**Status Codes**:
- `201`: Product created
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found

---

#### 6. PATCH /products/:id

**Summary**: Update product details (branch-level overrides)

**Authentication**: Required

**Authorization**: User with branch access or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireBranchAccess('branchId')`: Verify branch access (via query param)
- `rbac({resource: 'core:product', action: 'update', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `id` (number): Product ID

**Query Parameters**:
```
?branchId=1
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "imageUrl": "https://example.com/new-pasta.jpg",
  "categoryName": "Main Course",
  "price": 200,
  "stock": 30,
  "isAvailable": true
}
```

**Field Constraints**: All fields are optional

**Note**: `price`, `stock`, and `isAvailable` are branch-level overrides (require `branchId` query param)

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated description",
  "price": 200,
  "stock": 30,
  "isAvailable": true
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Product not found

---

### Customer Addresses Endpoints

#### 1. GET /customer/addresses

**Summary**: Get authenticated customer's saved addresses

**Authentication**: Required

**Request Headers**:
```
Cookie: access_token=eyJhbGc...
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "label": "Home",
      "country": "Egypt",
      "city": "Cairo",
      "street": "Main Street",
      "building": "123",
      "apartmentNumber": "4A",
      "type": "home",
      "lat": 30.043304,
      "lng": 31.200782,
      "isDefault": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

---

#### 2. POST /customer/addresses

**Summary**: Create a new customer address

**Authentication**: Required

**Request Body**:
```json
{
  "label": "Home",
  "country": "Egypt",
  "city": "Cairo",
  "street": "Main Street",
  "building": "123",
  "apartmentNumber": "4A",
  "type": "home",
  "lat": 30.043304,
  "lng": 31.200782,
  "isDefault": true
}
```

**Field Requirements**:
- `label`: Non-empty string (required)
- `country`: Non-empty string (required)
- `city`: Non-empty string (required)
- `street`: Non-empty string (required)
- `building`: Optional string
- `apartmentNumber`: Optional string
- `type`: Enum - `home`, `work`, `other` (required)
- `lat`: Valid latitude coordinate (required)
- `lng`: Valid longitude coordinate (required)
- `isDefault`: Boolean (required)

**Response** (201 Created):
```json
{
  "id": 1,
  "label": "Home",
  "country": "Egypt",
  "city": "Cairo",
  "street": "Main Street",
  "building": "123",
  "apartmentNumber": "4A",
  "type": "home",
  "lat": 30.043304,
  "lng": 31.200782,
  "isDefault": true,
  "createdAt": "2026-04-11T10:00:00Z"
}
```

**Status Codes**:
- `201`: Address created
- `400`: Invalid input
- `401`: Unauthorized

---

#### 3. PATCH /customer/addresses/:id

**Summary**: Update customer address

**Authentication**: Required

**Path Parameters**:
- `id` (number): Address ID

**Request Body**:
```json
{
  "label": "Updated Home",
  "city": "Giza",
  "lat": 30.050000,
  "lng": 31.205000
}
```

**Field Constraints**: All fields are optional

**Important**: When updating location fields (country, city, street, building, apartmentNumber), both `lat` and `lng` must be provided in the same request

**Response** (200 OK):
```json
{
  "id": 1,
  "label": "Updated Home",
  "country": "Egypt",
  "city": "Giza",
  "street": "Main Street",
  "lat": 30.050000,
  "lng": 31.205000
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Invalid input / Missing required location fields
- `401`: Unauthorized
- `404`: Address not found

---

#### 4. DELETE /customer/addresses/:id

**Summary**: Delete customer address

**Authentication**: Required

**Path Parameters**:
- `id` (number): Address ID

**Response** (200 OK):
```json
{
  "message": "Address deleted successfully"
}
```

**Status Codes**:
- `200`: Deleted successfully
- `401`: Unauthorized
- `404`: Address not found

---

### RBAC Endpoints

#### 1. GET /roles/:role/permissions

**Summary**: Get permissions for a specific role

**Authentication**: Not required

**Path Parameters**:
- `role` (string): Role name (e.g., `owner`, `manager`, `staff`)

**Response** (200 OK):
```json
{
  "role": "manager",
  "permissions": [
    {
      "resource": "core:restaurant",
      "actions": ["read", "update"]
    },
    {
      "resource": "core:product",
      "actions": ["read", "create", "update"]
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `404`: Role not found

---

#### 2. POST /restaurants/:restaurantId/members

**Summary**: Invite a new member to restaurant

**Authentication**: Required

**Authorization**: Restaurant member with create permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:member', action: 'create', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Request Body**:
```json
{
  "email": "member@example.com",
  "name": "Team Member",
  "phone": "01012345678",
  "role": "manager",
  "branchIds": [1, 2]
}
```

**Field Requirements**:
- `email`: Valid email (required)
- `name`: Non-empty string (required)
- `phone`: 10-11 digit phone number (required)
- `role`: Role name, cannot be `owner` (required)
- `branchIds`: Array of branch IDs this member can access (optional)

**Response** (201 Created):
```json
{
  "message": "Email was sent to member successfully",
  "data": {
    "member": {
      "id": 1,
      "userId": 2,
      "restaurantId": 1,
      "roleId": 3,
      "status": "inactive",
      "createdAt": "2026-04-11T10:00:00Z"
    },
    "roleName": "manager"
  }
}
```

**Status Codes**:
- `201`: Member invited
- `400`: Invalid input / Invalid branches
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found
- `409`: User with email already exists

---

#### 3. GET /restaurants/:restaurantId/members

**Summary**: List all members of a restaurant

**Authentication**: Required

**Authorization**: Restaurant member with read permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:member', action: 'read', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID

**Query Parameters**:
```
?status=active&limit=20&cursor=&sortBy=createdAt&sortOrder=desc
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "userId": 2,
      "email": "member@example.com",
      "name": "Team Member",
      "phone": "01012345678",
      "role": "manager",
      "roleDisplayName": "Manager",
      "status": "active"
    }
  ],
  "meta": {
    "nextCursor": "2026-01-16T10:00:00Z",
    "hasMore": true,
    "count": 1
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Restaurant not found

---

#### 4. PATCH /restaurants/:restaurantId/members/:memberId

**Summary**: Update member role and/or status

**Authentication**: Required

**Authorization**: Restaurant member with update permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:member', action: 'update', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID
- `memberId` (number): Member ID

**Request Body**:
```json
{
  "role": "staff",
  "status": "active"
}
```

**Field Requirements**: At least one field must be provided
- `role`: New role name (optional)
- `status`: New status - `active`, `inactive`, `suspended` (optional)

**Response** (200 OK):
```json
{
  "message": "Member updated successfully",
  "data": {
    "id": 1,
    "email": "member@example.com",
    "name": "Team Member",
    "role": "staff",
    "status": "active"
  }
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Member or restaurant not found

---

#### 5. DELETE /restaurants/:restaurantId/members/:memberId

**Summary**: Remove member from restaurant

**Authentication**: Required

**Authorization**: Restaurant member with delete permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:member', action: 'delete', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID
- `memberId` (number): Member ID

**Response** (200 OK):
```json
{
  "message": "Member deleted successfully"
}
```

**Status Codes**:
- `200`: Deleted successfully
- `401`: Unauthorized
- `403`: Cannot delete owner / Insufficient permissions
- `404`: Member or restaurant not found

---

#### 6. PUT /restaurants/:restaurantId/members/:memberId/branches

**Summary**: Update which branches a member can access

**Authentication**: Required

**Authorization**: Restaurant member with update permission or system admin

**Middleware**: 
- `authenticate`: Verify token
- `requireRestaurantMember('restaurantId')`: Verify membership
- `rbac({resource: 'core:member', action: 'update', allowSystemAdmin: true})`: Check permissions

**Path Parameters**:
- `restaurantId` (number): Restaurant ID
- `memberId` (number): Member ID

**Request Body**:
```json
{
  "branchIds": [1, 2, 3]
}
```

**Field Requirements**:
- `branchIds`: Array of branch IDs (required, can be empty for owner)

**Response** (200 OK):
```json
{
  "message": "Member branches updated successfully"
}
```

**Status Codes**:
- `200`: Updated successfully
- `400`: Invalid branch IDs
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Member or restaurant not found

---

## Pagination & Filtering

### Pagination Parameters

All list endpoints support pagination using cursor-based pagination with query parameters:

```
GET /restaurant?limit=20&cursor=&sortBy=createdAt&sortOrder=desc
```

**Parameters**:
- `limit`: Maximum number of results to return (default: 20, max: 100)
- `cursor`: Cursor value for fetching the next set of results (default: empty string for first page)
- `sortBy`: Field to sort by (default: createdAt, examples: createdAt, name, id)
- `sortOrder`: Sort direction - `asc` or `desc` (default: desc)

**Response Format**:
```json
{
  "data": [],
  "meta": {
    "nextCursor": "2026-01-15T10:00:00Z",
    "hasMore": true,
    "count": 20
  }
}
```

**Response Metadata**:
- `nextCursor`: Cursor value to use for fetching the next page. `null` if no more results available
- `hasMore`: Boolean indicating if there are more results beyond the current page
- `count`: Number of results in the current page

**Cursor Pagination Flow**:
1. Make initial request without cursor: `GET /restaurant?limit=20&sortBy=createdAt&sortOrder=desc`
2. Receive response with `meta.nextCursor`
3. For next page, use cursor: `GET /restaurant?limit=20&cursor=2026-01-15T10:00:00Z&sortBy=createdAt&sortOrder=desc`
4. Repeat until `meta.hasMore` is `false`

**Advantages of Cursor-based Pagination**:
- Handles insertions/deletions gracefully without skipping or duplicating results
- Consistent results even with concurrent data modifications
- Better performance for large datasets
- Prevents offset-based issues with changing data

### Filtering

Endpoints support filtering by status and other relevant fields:

**Example - Filter by Status**:
```
GET /restaurant?status=active
```

**Example - Filter by Multiple Criteria**:
```
GET /restaurants/1/branches?isActive=true&currency=EGP
```

### Sorting

Sorting is supported on all paginated list endpoints using the `sortBy` and `sortOrder` parameters:

**Example - Sort by Creation Date (Descending)**:
```
GET /restaurant?limit=20&sortBy=createdAt&sortOrder=desc
```

**Example - Sort by Name (Ascending)**:
```
GET /restaurants/1/branches?limit=20&sortBy=name&sortOrder=asc
```

**Supported Sort Fields** (varies by endpoint):
- `createdAt` - Creation timestamp (supported on most endpoints)
- `name` - Resource name (supported on restaurants, branches, products)
- `id` - Resource identifier (supported on most endpoints)

**Sort Order Values**:
- `asc` - Ascending order (A to Z, 0 to 9, oldest to newest)
- `desc` - Descending order (Z to A, 9 to 0, newest to oldest)

---

## Validation Rules

### Common Validation Rules

#### Email
- Must be a valid email format
- Example: `user@example.com`
- Error: `email must be a valid email`

#### Phone
- 10-11 digit numbers
- Supports country codes
- Example: `01012345678` or `+201012345678`

#### Password
- Minimum 8 characters
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 number
- Example: `SecurePass123`

#### Coordinates (Latitude/Longitude)
- Latitude: -90 to 90
- Longitude: -180 to 180
- Example: `lat: 30.043304, lng: 31.200782`

#### Country Codes
- ISO 3166-1 alpha-2 format
- Examples: `EG`, `AE`, `SA`, `JO`, `LB`

#### Time Format
- 24-hour format: `HH:MM`
- Examples: `09:00`, `23:30`

#### URLs
- Must be valid HTTP/HTTPS URLs
- Example: `https://example.com/image.jpg`

#### Enums

**SystemRole**:
- `customer`
- `restaurant_user`
- `delivery_agent`
- `system_admin`

**RestaurantStatus**:
- `active`
- `inactive`
- `suspended`
- `pending`

**MemberStatus**:
- `active`
- `inactive`
- `suspended`

**AddressType**:
- `home`
- `work`
- `other`

**Currency**:
- `EGP` (Egyptian Pound)
- `AED` (UAE Dirham)
- `SAR` (Saudi Riyal)
- `JOD` (Jordanian Dinar)
- `LBP` (Lebanese Pound)

---

## Security Considerations

### Input Validation
- All inputs are validated using DTO (Data Transfer Object) classes
- Invalid inputs return 400 Bad Request
- Strong type checking with TypeScript

### Password Security
- Passwords are hashed using bcrypt with salt rounds = 10
- Never returned in API responses
- Only accepted in specific auth endpoints

### Authentication & Authorization
- JWT tokens stored in HTTP-only cookies (prevents XSS)
- Secure flag enabled in production (HTTPS only)
- SameSite=Strict for CSRF protection
- Token expiry: Access token 1 hour, Refresh token 7 days

### Rate Limiting
- Currently not implemented
- Recommended: 100 requests per minute per IP
- Planned for v2

### CORS
- Origin validation performed on all requests
- Allow specific origins only in production
- Current: Configured in application middleware

### RBAC (Role-Based Access Control)
- Fine-grained permissions per resource and action
- Middleware checks at route level
- Examples:
  - Resource: `core:restaurant`, Action: `read`, `create`, `update`
  - Resource: `core:member`, Action: `read`, `create`, `update`, `delete`

### Database Security
- Connection pooling with max 10 connections
- Prepared statements (Knex.js provides protection against SQL injection)
- Transaction support for data consistency

### Data Privacy
- Customer addresses associated with user ID
- Member access restricted to their restaurant
- Branch access restricted by member role

---

## Versioning & Deprecation

### Current Version
- **Version**: 1.0.0 (implicit v1)
- **Release Date**: April 2026
- **Support Status**: Active

### Versioning Strategy

1. **Backward Compatibility**
   - v1 will maintain backward compatibility for 12 months minimum
   - Breaking changes require major version bump

2. **Future Versions**
   - v2, v3, etc., will be available at `/api/v2/`, `/api/v3/`
   - v1 will be maintained during transition period

3. **Deprecation Notice**
   - Announced 6 months before removal
   - Provided in response headers: `Deprecation: true`
   - Include migration guide in documentation

### Version Header
```
API-Version: 1.0.0
```

---

## Change Log

### Version 1.0.0

#### Added
- Authentication system (register, login, refresh, password reset)
- User profile management (/users/me)
- Restaurant management with owner creation
- Restaurant branch management with location tracking
- Product catalog with categories
- Customer address management (CRUD)
- RBAC system with roles and permissions
- Member management for restaurants
- Health check endpoint

#### Features
- JWT-based authentication with HTTP-only cookies
- Request correlation ID tracking
- Comprehensive error handling
- Input validation with DTOs
- Role-based access control (RBAC)
- Transaction support for data consistency

#### Security
- Password hashing with bcrypt
- SQL injection prevention via Knex.js
- CSRF protection via SameSite cookies
- XSS prevention via HTTP-only cookies
- Input validation on all endpoints


---

## Common Use Cases

### Use Case 1: Restaurant Owner Registration and Setup

**Scenario**: A restaurant owner wants to register and set up their restaurant.

**Steps**:

1. **Register Account**
```bash
POST /api/auth/register
{
  "email": "owner@restaurant.com",
  "phone": "01012345678",
  "name": "Ahmed Hassan",
  "password": "SecurePass123",
  "role": "restaurant_user",
  "restaurant": {
    "name": "My Restaurant",
    "primaryCountry": "EG",
    "logoURL": "https://example.com/logo.png"
  }
}
```

2. **Login**
```bash
POST /api/auth/login
{
  "email": "owner@restaurant.com",
  "password": "SecurePass123"
}
```

3. **Create First Branch**
```bash
POST /api/restaurants/1/branches
Headers: Cookie: access_token=...
{
  "label": "Downtown",
  "countryCode": "EG",
  "lat": 30.043304,
  "lng": 31.200782,
  "addressText": "123 Main Street, Cairo",
  "opensAt": "09:00",
  "closesAt": "23:00",
  "currency": "EGP",
  "deliveryRadius": 5
}
```

4. **Add Menu Items**
```bash
POST /api/restaurants/1/products
Headers: Cookie: access_token=...
{
  "name": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "imageUrl": "https://example.com/pasta.jpg",
  "categoryName": "Main Course"
}
```

5. **Invite Team Member**
```bash
POST /api/restaurants/1/members
Headers: Cookie: access_token=...
{
  "email": "manager@restaurant.com",
  "name": "Ali Ahmed",
  "phone": "01098765432",
  "role": "manager",
  "branchIds": [1]
}
```

---

### Use Case 2: Customer Orders - Address Management

**Scenario**: A customer saves delivery addresses and places orders.

**Steps**:

1. **Login**
```bash
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "SecurePass123"
}
```

2. **Save Home Address**
```bash
POST /api/customer/addresses
Headers: Cookie: access_token=...
{
  "label": "Home",
  "country": "Egypt",
  "city": "Cairo",
  "street": "Main Street",
  "building": "123",
  "apartmentNumber": "4A",
  "type": "home",
  "lat": 30.043304,
  "lng": 31.200782,
  "isDefault": true
}
```

3. **Save Work Address**
```bash
POST /api/customer/addresses
Headers: Cookie: access_token=...
{
  "label": "Work",
  "country": "Egypt",
  "city": "Cairo",
  "street": "Business Boulevard",
  "building": "456",
  "type": "work",
  "lat": 30.050000,
  "lng": 31.210000,
  "isDefault": false
}
```

4. **Get My Addresses**
```bash
GET /api/customer/addresses
Headers: Cookie: access_token=...
```

5. **Update Address**
```bash
PATCH /api/customer/addresses/1
Headers: Cookie: access_token=...
{
  "building": "125",
  "apartmentNumber": "5B",
  "lat": 30.045000,
  "lng": 31.202000
}
```

---

### Use Case 3: Team Member Access and Permissions

**Scenario**: Managing team member access across multiple branches.

**Steps**:

1. **Owner Invites Manager**
```bash
POST /api/restaurants/1/members
Headers: Cookie: access_token=...
{
  "email": "manager@rest.com",
  "name": "Manager",
  "phone": "01012345678",
  "role": "manager",
  "branchIds": [1, 2]
}
```

2. **Manager Accepts Invite**
```bash
POST /api/auth/accept-invite
{
  "email": "manager@rest.com",
  "otp": "123456",
  "newPassword": "SecurePass123"
}
```

3. **Manager Logs In**
```bash
POST /api/auth/login
{
  "email": "manager@rest.com",
  "password": "SecurePass123"
}
```

4. **Get Members List**
```bash
GET /api/restaurants/1/members
Headers: Cookie: access_token=...
```

5. **Update Manager Branches**
```bash
PUT /api/restaurants/1/members/2/branches
Headers: Cookie: access_token=...
{
  "branchIds": [1, 2, 3]
}
```

---

## Quick Reference

### Essential Headers

```
Content-Type: application/json
Accept: application/json
X-Correlation-ID: <unique-id>
Cookie: access_token=<token>; refresh_token=<token>
```

### HTTP Methods Summary

| Method | Purpose | Response |
|--------|---------|----------|
| GET | Retrieve resources | 200 OK |
| POST | Create resources | 201 Created |
| PATCH | Partial update | 200 OK |
| PUT | Full/branch update | 200 OK |
| DELETE | Remove resources | 200 OK |

### Common Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Unexpected error |



