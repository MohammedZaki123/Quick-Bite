✅ SERVICE A — CORE PLATFORM

🔐 AUTH & IDENTITY

POST /auth/register
Auth: ❌
Request
{   
"email": "user@email.com",
"phone": "01000000000",
"name": "John Doe",
"password": "StrongPassword123"
}
201 SUCCESS
{
"message": "Regifastered successfully",
"accessToken": "jwt",
"refreshToken": "jwt",
"user": {
"id": 1,
"email": "user@email.com",
"phone": "01000000000",
"name": "John Doe",
"systemRole": "customer",
"createdAt": "2026-02-14T12:00:00.000Z"
}
}

POST /auth/login
Auth: ❌
Request
{
"email": "user@email.com",
"password": "password"
}
200 SUCCESS
{
"message": "Login successful",
"accessToken": "jwt",
"refreshToken": "jwt",
"user": {
"id": 1,
"email": "user@email.com",
"phone": "01000000000",
"name": "John Doe",
"systemRole": "customer"
}
}

POST /auth/forgot-password
Auth: ❌
Request
{
"email": "user@email.com"
}
200 SUCCESS
{
"message": "Reset email sent if account exists"
}

POST /auth/reset-password
Auth: ❌
Request
{
"email": "user@email.com",
"otp": "123456",
"newPassword": "NewStrongPassword"
}
200 SUCCESS
{
"message": "Password reset successful"
}

POST /auth/refresh
Auth: ❌
Request
{
"refreshToken": "jwt"
}
200 SUCCESS
{
"accessToken": "jwt"
}

GET /users/me
Auth: ✅
200 SUCCESS
{
"id": 1,
"email": "user@email.com",
"phone": "01000000000",
"name": "John Doe",
"systemRole": "customer"
}

PATCH /users/me
Auth: ✅
Request
{
"name": "New Name",
"phone": "01000000001"
}
200 SUCCESS
{
"message": "Profile updated",
"user": {
"id": 1,
"email": "user@email.com",
"phone": "01000000001",
"name": "New Name",
"systemRole": "customer"
}
}

📍 CUSTOMER ADDRESSES

GET /customer/addresses?page=1&limit=10
Auth: ✅
200 SUCCESS
{
"data": [   
{
"id": 1,
"label": "Home",
"type": "home",
"country": "Egypt",
"city": "Cairo",
"street": "Tahrir Street",
"building": "15",
"apartmentNumber": "4B",
"lat": 30.1,
"lng": 31.2,
"isDefault": true
}
],
"pagination": {
"page": 1,
"limit": 10,
"total": 1,
"totalPages": 1
}
}

POST /customer/addresses
Auth: ✅
Request
{
"label": "Home",
"type": "home",
"country": "Egypt",
"city": "Cairo",
"street": "Tahrir Street",
"building": "15",
"apartmentNumber": "4B",
"lat": 30.1,
"lng": 31.2,
"isDefault": false
}
201 SUCCESS
{
"message": "Address added",
"address": {
"id": 1,
"label": "Home",
"type": "home",
"country": "Egypt",
"city": "Cairo",
"street": "Tahrir Street",
"building": "15",
"apartmentNumber": "4B",
"lat": 30.1,
"lng": 31.2,
"isDefault": false
}
}

PATCH /customer/addresses/{addressId}
Auth: ✅
Request
{
"label": "Work",
"type": "office",
"country": "Egypt",
"city": "Cairo",
"street": "Nasr City Main Road",
"building": "Tower 3",
"apartmentNumber": "12th Floor",
"lat": 30.2,
"lng": 31.3
}
200 SUCCESS
{
"message": "Address updated",
"address": {
"id": 1,
"label": "Work",
"type": "office",
"country": "Egypt",
"city": "Cairo",
"street": "Nasr City Main Road",
"building": "Tower 3",
"apartmentNumber": "12th Floor",
"lat": 30.2,
"lng": 31.3,
"isDefault": false
}
}

DELETE /customer/addresses/{addressId}
Auth: ✅
200 SUCCESS
{
"message": "Address deleted"
}

🍽 RESTAURANTS (Public + Owner + Admin)

GET /restaurants?lat=&lng=
Public
200 SUCCESS
[
{
"id": 1,
"name": "Burger House",
"logoUrl": "url",
"primaryCountry": "EG"
}
]

GET /restaurants/{restaurantId}
200 SUCCESS
{
"id": 1,
"name": "Burger House",
"status": "ACTIVE",
"primaryCountry": "EG"
}

POST /restaurants
Auth: ADMIN or RESTAURANT_USER (owner)
Request
{
"name": "Burger House",
"primaryCountry": "EG"
}
201 SUCCESS
{
"message": "Restaurant created",
"restaurantId": 1
}

PATCH /restaurants/{restaurantId}
200 SUCCESS
{
"message": "Restaurant updated"
}

PATCH /restaurants/{restaurantId}/status
Auth: ADMIN
Request
{
"status": "ACTIVE | DISABLED"
}
200 SUCCESS
{
"message": "Status updated"
}

🏢 BRANCHES

GET /restaurants/{restaurantId}/branches
200 SUCCESS
[
{
"id": 10,
"label": "Nasr City",
"countryCode": "EG",
"lat": 30.1,
"lng": 31.3,
"isActive": true,
"deliveryRadius": 5
}
]

POST /restaurants/{restaurantId}/branches
201 SUCCESS
{
"message": "Branch created",
"branchId": 10
}

PATCH /branches/{branchId}
200 SUCCESS
{
"message": "Branch updated"
}

PATCH /branches/{branchId}/status
200 SUCCESS
{
"message": "Branch status updated"
}

PUT /branches/{branchId}/delivery-zone
Request
{
"radiusKm": 5
}
200 SUCCESS
{
"message": "Delivery zone updated"
}

📜 MENUS

GET /branches/{branchId}/menu
200 SUCCESS
{
"menuId": 1,
"products": [
{
"id": 1,
"name": "Burger",
"description": "Beef burger",
"imageUrl": "url",
"price": 120,
"currency": "EGP",
"isAvailable": true
}
]
}

POST /restaurants/{restaurantId}/menus
201 SUCCESS
PATCH /menus/{menuId}
200 SUCCESS
PATCH /menus/{menuId}/status
200 SUCCESS

🥩 PRODUCTS + PRICING

POST /menus/{menuId}/products
201 SUCCESS
PATCH /products/{productId}
200 SUCCESS
PATCH /products/{productId}/status
200 SUCCESS
PATCH /branches/{branchId}/products/{productId}
Request
{
"price": 130,
"isAvailable": true
}
200 SUCCESS
{
"message": "Branch product updated"
}

👥 RESTAURANT MEMBERS

GET /restaurants/{restaurantId}/members
200 SUCCESS
POST /restaurants/{restaurantId}/members
201 SUCCESS
PATCH /restaurants/{restaurantId}/members/{memberId}
200 SUCCESS
DELETE /restaurants/{restaurantId}/members/{memberId}
200 SUCCESS

🔐 BRANCH ACCESS

GET /restaurants/{restaurantId}/members/{memberId}/branches
200 SUCCESS
PUT /restaurants/{restaurantId}/members/{memberId}/branches
Request
{
"branchIds": [1,2,3]
}
200 SUCCESS
{
"message": "Branch access updated"
}

🧩 ROLES & PERMISSIONS

GET /restaurants/{restaurantId}/roles
200 SUCCESS
POST /restaurants/{restaurantId}/roles
201 SUCCESS
PATCH /restaurants/{restaurantId}/roles/{roleId}
200 SUCCESS
PUT /restaurants/{restaurantId}/roles/{roleId}/permissions
Request
{
"permissionIds": [1,2,3]
}
200 SUCCESS
{
"message": "Permissions updated"
}
