# Authorization Middleware Analysis Report
**Quick-Bite Core Service**  
**Generated:** April 7, 2026

---

## Executive Summary

The Quick-Bite Core Service implements a **layered authorization approach** combining JWT-based authentication with Role-Based Access Control (RBAC) and resource-level access restrictions. The system uses a **hybrid authorization model** with three distinct mechanisms:

1. **Authentication Guard** - JWT token verification
2. **Role-Based Access Control (RBAC)** - Permission-based access via role assignments
3. **Organizational Boundary Enforcement** - Restaurant and Branch-level resource ownership validation

---

## 1. Authorization Mechanisms Implemented

### 1.1 JWT Authentication (Token-Based Authentication)

**Location:** `src/common/auth/guard.ts`

**Mechanism:** `authenticate` middleware function

```typescript
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.access_token;
    if(!token) {
        throw NotAuthenticated;
    }
    req.user = verifyAccessToken(token);
    next();
}
```

**Implementation Details:**
- **Token Extraction:** Retrieves JWT from HTTP-only cookies (`access_token`)
- **Token Verification:** Validates JWT signature using `env.jwt.accessSecret`
- **Payload Attachment:** Decodes and attaches `JwtPayload` to `req.user`
- **Error Handling:** Throws `NotAuthenticated` (401) if token missing

**JWT Payload Structure:**
```typescript
type JwtPayload = {
    userId: number;
    email: string;
    role: string;              // SystemRole enum: 'system_admin', 'customer', 'restaurant_user', 'delivery_agent'
    restaurantId?: number;     // For restaurant_user role
    restaurantRole?: string;   // Contextual role: 'owner', 'branch_manager', 'staff'
    branchIds?: number[];      // Array of branch IDs user is assigned to
}
```

**Token Generation:** `src/app/auth/utils.ts`
- Access tokens: Configurable expiration (from env)
- Refresh tokens: Separate lifecycle management
- Created during login/registration flows

---

### 1.2 Role-Based Access Control (RBAC)

**Location:** `src/common/auth/rbac.ts`

**Primary Mechanism:** `rbac()` middleware factory

```typescript
export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean; // Bypass permissions check
}
```

**Implementation Details:**

**Architecture:**
- **Cache-First Approach:** Permissions cached for 1 hour per role to reduce DB load
- **Cache Location:** `src/app/rbac/service/permission-cache.service.ts`
- **Fallback:** Database query if cache miss or TTL expired

**Permission Check Flow:**
1. Check if user is `SYSTEM_ADMIN` and `allowSystemAdmin=true` → Grant access
2. Retrieve permissions for user's `restaurantRole` from cache/database
3. Check if permissions array contains `{resource}:{action}` string
4. Return 403 Forbidden if permission denied, otherwise proceed

**Permission Structure:**
```
Resource Format: 'core:{entity}' (e.g., 'core:product', 'core:member', 'core:branch')
Action Format: 'read', 'create', 'update', 'delete'
Stored As: 'core:product:read' (concatenated in database and cache)
```

**Predefined Roles & Permissions:**
- **Owner** → All permissions across all resources
- **Branch Manager** → Limited to: product CRUD, member read, branch update
- **Staff** → Read-only access (product read, member read)

**Cache Service Implementation:**
```typescript
class PermissionCacheService {
    private cache: Map<string, {permissions: String[], cachedAt: number}>;
    private TTL = 1 hour;
    
    getPermissions(role: string) {
        // Check cache with TTL validation
        // Fall back to database if expired
    }
    
    hasPermission(permissions: String[], resource: string, action: string) {
        return permissions.includes(`${resource}:${action}`);
    }
}
```

---

### 1.3 Organizational Boundary Enforcement (Resource-Level Access)

**Location:** `src/common/auth/rbac.ts`

#### 1.3.1 Restaurant-Level Access Control

**Mechanism:** `requireRestaurantMember()` middleware

```typescript
export function requireRestaurantMember(param: string = 'restaurantId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const restaurantId = validatePathParameter(param, "Restaurant ID");
        
        // SYSTEM_ADMIN bypass
        if(req.user?.role == SystemRole.SYSTEM_ADMIN) {
            return next();
        }
        
        // Validate ownership/membership
        if(req.user?.restaurantId !== restaurantId) {
            return res.status(403).json({error: "Permission denied"});
        }
        
        return next();
    }
}
```

**Checks Performed:**
- Extracts restaurant ID from request path parameter
- Allows SYSTEM_ADMIN users to bypass
- Verifies user's `restaurantId` matches the resource's `restaurantId`
- Returns 403 if mismatch

**Use Cases:**
- POST `/restaurants/:restaurantId/members` - Create member for specific restaurant
- POST `/restaurants/:restaurantId/branches` - Create branch for specific restaurant
- PATCH `/restaurants/:id` - Edit restaurant settings

---

#### 1.3.2 Branch-Level Access Control

**Mechanism:** `requireBranchMember()` middleware

```typescript
export function requireBranchMember(param: string = 'branchId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const branchId = validatePathParameter(param, "Branch ID");
        
        // SYSTEM_ADMIN bypass
        if(req.user?.role == SystemRole.SYSTEM_ADMIN) {
            return next();
        }
        
        // Validate membership
        if(!req.user?.branchIds?.includes(branchId)) {
            return res.status(403).json({error: "Permission denied"});
        }
        
        return next();
    }
}
```

**Checks Performed:**
- Extracts branch ID from request path parameter
- Allows SYSTEM_ADMIN users to bypass
- Verifies user's `branchIds` array contains the requested `branchId`
- Returns 403 if user not assigned to branch

**Use Cases:**
- Operations restricted to users assigned to specific branches
- Multi-branch managers can access multiple branches (via array)

---

## 2. Middleware Integration & Request Flow

### 2.1 Standard Authorization Chain

**Pattern:** Most protected routes follow this middleware stack:

```
Request → 1. authenticate (JWT verification)
        → 2. requireRestaurantMember/requireBranchMember (ownership check)
        → 3. rbac (permission check)
        → 4. Route Handler
```

### 2.2 Real-World Example

**Route:** `POST /restaurants/:restaurantId/members`

**File:** `src/app/rbac/routes.ts`

```typescript
rbacRouter.post('/restaurants/:restaurantId/members',
    authenticate,                           // Step 1: Verify JWT
    requireRestaurantMember('restaurantId'), // Step 2: Check restaurant ownership
    rbac({resource:"core:member", action:'create'}), // Step 3: Check permission
    memberController.createMember           // Step 4: Execute handler
);
```

**Flow:**
1. Extract JWT from cookies
2. Verify signature and validate token expiration
3. Ensure user owns/is member of specified restaurant
4. Verify user's role has `core:member:create` permission
5. Execute `createMember` business logic

---

### 2.3 Middleware Coverage by Route Type

#### Protected Routes (Authentication + Authorization)
- `POST /restaurants/:restaurantId/members` (Full 3-layer stack)
- `PATCH /restaurants/:id` (Authenticate + Restaurant boundary)
- `POST /restaurants/:restaurantId/branches` (Authenticate + Restaurant boundary)
- `PATCH /branches/:id` (Authenticate + Branch boundary)
- `GET /restaurants/:restaurantId/products` (Authenticate only)
- `POST /restaurants/:restaurantId/products` (Authenticate only)
- `GET /users/me` (Authenticate only)
- `PATCH /users/me` (Authenticate only)

#### Unprotected Routes (Public Access)
- `GET /branches/nearby` (Geolocation query - no auth)
- `GET /branches/:restaurantId/branches` (Public branch list)
- `GET /restaurants/:id` (Public restaurant details)
- `GET /products/:id` (Public product details)
- `GET /restaurants` (All restaurants list)
- Auth endpoints: `/login`, `/register`, `/forget-password`, `/reset-password`

---

## 3. Authorization Patterns & Frameworks

### 3.1 Design Patterns Used

| Pattern | Implementation | Purpose |
|---------|-----------------|---------|
| **Middleware Chain** | Express middleware stack | Sequential authorization checks |
| **Factory Pattern** | `rbac()`, `requireRestaurantMember()` return middleware functions | Parameterized authorization logic |
| **Cache-Aside Pattern** | Permission cache with TTL | Reduce database load for permission checks |
| **Decorator Pattern** | Middleware wraps route handlers | Separation of concerns (auth vs business logic) |
| **Bypass Pattern** | SYSTEM_ADMIN role check | Super-admin privilege escalation |

### 3.2 Token-Based Framework

**JWT Implementation:**
- **Library:** `jsonwebtoken` (Node.js standard)
- **Storage:** HTTP-only cookies (secure, XSS-resistant)
- **Verification:** HMAC-SHA256 with secret keys
- **Expiration:** Configurable via environment variables
- **Refresh Token:** Separate lifecycle for token rotation

### 3.3 Permission Model

**Type:** Attribute-Based Access Control (ABAC) with RBAC Simplification

The system combines:
- **RBAC Core:** Roles (owner, branch_manager, staff) with associated permissions
- **Organizational Attributes:** `restaurantId`, `branchIds` (resource-based attributes)
- **System-Level Attributes:** `role` (SystemRole enum: system_admin, restaurant_user, customer, delivery_agent)

---

## 4. Security Analysis: Gaps & Concerns

### 4.1 Critical Issues

#### ⚠️ **Issue #1: Missing Branch Validation in Member Creation**

**Location:** `src/app/rbac/service/member.service.ts`, Line 73

```typescript
if(data.branchIds) {
    const memberBranches = data.branchIds.map(branchId => 
        new MemberBranch({memberId: member.id, branchId, ...})
    )
    // TODO: check that those branches belong to that restaurant
    await setMemberBranches(memberBranches, trx);
}
```

**Risk:** A malicious restaurant_user could assign members to branches outside their restaurant or even non-existent branches.

**Recommendation:** Add validation:
```typescript
// Validate all branchIds belong to the restaurant
const validBranches = await getBranchesByRestaurant(restaurantId);
const validBranchIds = validBranches.map(b => b.id);
const invalidIds = data.branchIds.filter(id => !validBranchIds.includes(id));
if(invalidIds.length > 0) throw new Error('Invalid branch IDs');
```

---

#### ⚠️ **Issue #2: RBAC Middleware Not Applied Consistently**

**Location:** Multiple route files

**Problem:** Not all protected routes implement the full 3-layer authorization:

```typescript
// GOOD: Full stack
rbacRouter.post('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'create'}),
    memberController.createMember
);

// BAD: Missing RBAC permission check
productRouter.post('/restaurants/:restaurantId/products', 
    authenticate,  // ✓ Only authenticates user
    productController.create // ✗ No restaurant boundary check, no permission check
);

// BAD: Missing RBAC permission check
branchRouter.post('/restaurants/:restaurantId/branches',
    authenticate,  // ✓ Only authenticates user
    branchController.addBranch // ✗ No restaurant boundary check, no permission check
);
```

**Risk:** Users could perform operations they shouldn't have permission for.

**Recommendation:** Apply consistent middleware stack to all mutation routes:
```typescript
branchRouter.post('/restaurants/:restaurantId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:branch", action:'create'}),
    branchController.addBranch
);
```

---

#### ⚠️ **Issue #3: Incomplete Error Handling in Middleware**

**Location:** `src/common/auth/rbac.ts`, `requireRestaurantMember()`, `requireBranchMember()`

**Problem:** Middleware doesn't use `next(err)` for async operations:

```typescript
export function requireRestaurantMember(param: string = 'restaurantId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const restaurantId = validatePathParameter(param, "Restaurant ID");
        // validatePathParameter might throw, but no try/catch here
        // This could crash the server or leak errors
        if(req.user?.restaurantId !== restaurantId) {
            return res.status(403).json({error: "Permission denied"});
        }
        next();
    }
}
```

**Recommendation:** Add error handling:
```typescript
export function requireRestaurantMember(param: string = 'restaurantId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = validatePathParameter(param, "Restaurant ID");
            if(req.user?.role == SystemRole.SYSTEM_ADMIN) {
                return next();
            }
            if(req.user?.restaurantId !== restaurantId) {
                return res.status(403).json({error: "Permission denied"});
            }
            next();
        } catch(err) {
            next(err);
        }
    }
}
```

---

### 4.2 Medium Priority Issues

#### ⚠️ **Issue #4: Cache TTL Too Long**

**Location:** `src/app/rbac/service/permission-cache.service.ts`

```typescript
private readonly TTL = toMs(1, 'h'); // 1 hour cache
```

**Risk:** If a user's role/permissions are revoked, they retain cached permissions for up to 1 hour.

**Recommendation:** Reduce to 15-30 minutes, or implement cache invalidation on role changes.

---

#### ⚠️ **Issue #5: No Rate Limiting on Authentication Endpoints**

**Location:** `src/app/auth/routes.ts`

```typescript
authRouter.post('/login', authController.login);
authRouter.post('/forget-password', authController.forgetPassword);
authRouter.post('/reset-password', authController.resetPassword);
```

**Risk:** Brute force attacks possible on login/password reset endpoints.

**Recommendation:** Implement rate limiting middleware (e.g., `express-rate-limit`).

---

#### ⚠️ **Issue #6: Missing CORS Configuration**

**Risk:** If CORS not properly configured, authentication tokens could be stolen via cross-origin attacks.

**Recommendation:** Validate CORS configuration in `src/app.ts`.

---

### 4.3 Low Priority Issues

#### ℹ️ **Issue #7: AllowSystemAdmin Default Behavior**

**Current Code:**
```typescript
if(option.allowSystemAdmin && req.user?.role == SystemRole.SYSTEM_ADMIN) {
    return next();
}
```

**Issue:** `allowSystemAdmin` defaults to `true` (comment says "by default will be true"), but explicit logic doesn't show a default. Unclear if not specified = true or false.

**Recommendation:** Make explicit:
```typescript
const allowSystemAdmin = option.allowSystemAdmin ?? true;
if(allowSystemAdmin && req.user?.role == SystemRole.SYSTEM_ADMIN) {
    return next();
}
```

---

## 5. Authorization Type Classification

### 5.1 Primary Authorization Type: **Hybrid RBAC + ABAC**

The system is primarily **Role-Based Access Control (RBAC)** but includes **Attribute-Based Access Control (ABAC)** components.

**RBAC Components:**
- Roles: `owner`, `branch_manager`, `staff`, `system_admin`
- Permissions: `core:resource:action` format
- Assignment: Via `role_permissions` junction table

**ABAC Components:**
- `restaurantId` - Organizational boundary attribute
- `branchIds` - Sub-organizational membership attribute
- `systemRole` - User type attribute

---

### 5.2 Is Branch-Level Access Control ABAC?

**Answer:** **Partially - it uses ABAC logic but within an RBAC framework.**

**Analysis:**

The branch-level access restriction (`requireBranchMember`) is **attribute-based** because it:
1. Checks a user attribute (`branchIds` array)
2. Compares it against a resource attribute (`branchId`)
3. Makes authorization decision based on attribute match

**However,** it's better classified as **hierarchical RBAC** or **RBAC with organizational scoping** because:
- The `branchIds` are assigned through the role system (user gets role, role gets branch assignments)
- It's not a full ABAC system (no complex attribute rules, policies, conditions)
- It's a simple membership check, not attribute evaluation

**Accurate Classification:**
```
┌─────────────────────────────────────┐
│ Authorization Model: Layered RBAC   │
├─────────────────────────────────────┤
│ Layer 1: System-Level RBAC          │
│   - SystemRole enum                 │
│   - system_admin bypass              │
│                                      │
│ Layer 2: Organization RBAC + ABAC   │
│   - Roles: owner, branch_manager... │
│   - Permissions: core:resource:act   │
│   - Attributes: restaurantId         │
│                                      │
│ Layer 3: Sub-Organization Scoping    │
│   - Branch membership (ABAC)         │
│   - Attribute: branchIds array       │
└─────────────────────────────────────┘
```

**More Precise Terms:**
- **restaurant-level**: ABAC (attribute-based resource ownership)
- **branch-level**: ABAC (attribute-based membership scoping)
- **permission-level**: RBAC (role-based access via permissions matrix)

---

## 6. Summary Table: Authorization Mechanisms

| Mechanism | Type | Location | Scope | Key Check |
|-----------|------|----------|-------|-----------|
| **JWT Verify** | Authentication | `src/common/auth/guard.ts` | Global | Token signature + expiration |
| **RBAC** | Authorization | `src/common/auth/rbac.ts` | Granular | `role → permission → action` |
| **Restaurant Boundary** | ABAC | `src/common/auth/rbac.ts` | Resource | `user.restaurantId === resourceId` |
| **Branch Membership** | ABAC | `src/common/auth/rbac.ts` | Resource | `resourceId in user.branchIds` |
| **System Admin Bypass** | Super-Admin | All middleware | Global | `SystemRole.SYSTEM_ADMIN` |

---

## 7. Recommendations Priority Matrix

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 **Critical** | Missing branch validation in member creation | Data integrity breach | Low |
| 🔴 **Critical** | Inconsistent RBAC middleware application | Privilege escalation | Medium |
| 🟠 **High** | Missing error handling in async middleware | Service crashes | Low |
| 🟠 **High** | Missing rate limiting on auth endpoints | Brute force attacks | Low |
| 🟡 **Medium** | Cache TTL too long (1 hour) | Permission delays | Low |
| 🟡 **Medium** | Missing CORS validation | Token theft | Low |
| 🟢 **Low** | Unclear allowSystemAdmin default | Code maintainability | Low |

---

## 8. Implementation Checklist

- [ ] Add branch validation in `memberService.createMember()`
- [ ] Apply `rbac()` middleware to all mutation routes (POST, PATCH, DELETE)
- [ ] Wrap `requireRestaurantMember()` and `requireBranchMember()` in try/catch
- [ ] Reduce permission cache TTL to 15-30 minutes
- [ ] Implement rate limiting on `/auth/*` endpoints
- [ ] Verify CORS configuration in `src/app.ts`
- [ ] Make `allowSystemAdmin` default explicit in RBAC middleware
- [ ] Add unit tests for authorization middleware
- [ ] Document authorization flow in architecture docs
- [ ] Add authorization audit logging

---

## 9. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  1. authenticate middleware     │
        │  - Extract JWT from cookies    │
        │  - Verify signature            │
        │  - Decode payload              │
        │  - Attach to req.user          │
        └────────────┬───────────────────┘
                     │ (Token valid)
                     ▼
    ┌────────────────────────────────────────┐
    │  2. requireRestaurantMember/           │
    │     requireBranchMember middleware     │
    │  - Extract resource ID from params    │
    │  - Check SystemRole bypass            │
    │  - Validate user ownership/membership │
    └────────────┬───────────────────────────┘
                 │ (Resource authorized)
                 ▼
    ┌────────────────────────────────────────┐
    │  3. rbac() middleware                  │
    │  - Get permissions from cache/DB       │
    │  - Check resource:action permission    │
    │  - Apply SystemAdmin bypass            │
    └────────────┬───────────────────────────┘
                 │ (Permission granted)
                 ▼
        ┌────────────────────────────┐
        │  Route Handler             │
        │  - Execute business logic  │
        │  - Return response         │
        └────────────────────────────┘
```

---

**End of Report**

