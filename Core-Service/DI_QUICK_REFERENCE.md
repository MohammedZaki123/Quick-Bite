# Dependency Injection Pattern - Quick Reference

## 📋 Pattern Overview

All controllers and services in the Quick-Bite Core Service now follow this enterprise DI pattern.

---

## 🔷 Service Pattern

### Step 1: Add @injectable Decorator
```typescript
import { injectable } from "tsyringe";

@injectable()
export class UserService {
  // Implementation
}

// ❌ NO LONGER: export const userService = new UserService();
```

### Step 2: Inject Dependencies
```typescript
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class RestaurantService {
  constructor(
    @inject(TOKENS.UserService) private userService: UserService
  ) {}
}
```

---

## 🔶 Controller Pattern

### Step 1: Add @injectable Decorator
```typescript
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class UserController {
  constructor(@inject(TOKENS.UserService) private userService: UserService) {}

  getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
  }
}

// ❌ NO LONGER: export const userController = new UserController(userService);
```

---

## 🔸 Routes Pattern

### Step 1: Import Class (Not Instance)
```typescript
// ✅ CORRECT
import { UserController } from "./controller/user.controller";
import { container } from "tsyringe";
import { TOKENS } from "../../lib/di/tokens";

// ❌ WRONG
// import { userController } from "./controller/user.controller";
```

### Step 2: Resolve from Container
```typescript
export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

userRouter.get('/me', authenticate, userController.getUserInfo);
userRouter.patch('/me', authenticate, userController.editUserInfo);
```

---

## 🎯 Complete Example

### Before (Old Pattern)
```typescript
// service/user.service.ts
export class UserService {
  getUserInfo() {}
}
export const userService = new UserService();

// controller/user.controller.ts
export class UserController {
  constructor(private userService: UserService) {}
}
export const userController = new UserController(userService);

// routes.ts
import { userController } from "./controller/user.controller";
userRouter.get('/me', userController.getUserInfo);
```

### After (New DI Pattern)
```typescript
// service/user.service.ts
@injectable()
export class UserService {
  getUserInfo() {}
}

// controller/user.controller.ts
@injectable()
export class UserController {
  constructor(@inject(TOKENS.UserService) private userService: UserService) {}
}

// routes.ts
import { UserController } from "./controller/user.controller";
const userController = container.resolve<UserController>(TOKENS.UserController);
userRouter.get('/me', userController.getUserInfo);
```

---

## 📦 Available TOKENS

```typescript
// src/lib/di/tokens.ts
export const TOKENS = {
  // Services
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  RestaurantService: Symbol.for("RestaurantService"),
  BranchService: Symbol.for("BranchService"),
  MemberService: Symbol.for("MemberService"),
  ProductService: Symbol.for("ProductService"),
  CustomerAddressService: Symbol.for("CustomerAddressService"),
  PermissionCacheService: Symbol.for("PermissionCacheService"),
  
  // Controllers
  AuthController: Symbol.for("AuthController"),
  UserController: Symbol.for("UserController"),
  RestaurantController: Symbol.for("RestaurantController"),
  BranchController: Symbol.for("BranchController"),
  MemberController: Symbol.for("MemberController"),
  ProductController: Symbol.for("ProductController"),
  CustomerAddressController: Symbol.for("CustomerAddressController"),
}
```

---

## 🔐 Type-Safe Generic Resolution

```typescript
// ✅ Type-safe
const userController = container.resolve<UserController>(TOKENS.UserController);

// Compiler ensures:
// 1. TOKENS.UserController is valid
// 2. Generic type matches the token
// 3. Return type is UserController
```

---

## 📍 DI Container Registration

All classes are registered as **singletons**:

```typescript
// src/lib/di/container.ts
container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<UserController>(TOKENS.UserController, UserController);

// This means:
// - Only ONE instance of UserService exists
// - Only ONE instance of UserController exists
// - Shared across entire application
```

---

## ✨ Benefits Summary

| Aspect | Benefit |
|--------|---------|
| **Type Safety** | Compile-time checking with TypeScript |
| **Testability** | Easy to mock dependencies |
| **Maintainability** | Clear dependency graph |
| **Scalability** | Easy to add new services |
| **Consistency** | Same pattern everywhere |
| **Singleton** | Single instance per service |
| **Loose Coupling** | Dependencies are injected |
| **SOLID** | Follows Dependency Inversion |

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Manual Instantiation
```typescript
// ❌ WRONG
export const userService = new UserService();
export const userController = new UserController(userService);
```

### ❌ DON'T: Import Singleton Instances
```typescript
// ❌ WRONG
import { userService } from "../service/user.service";
import { userController } from "../controller/user.controller";
```

### ❌ DON'T: Skip @injectable Decorator
```typescript
// ❌ WRONG
export class UserService {} // Missing @injectable()
```

### ❌ DON'T: Skip @inject on Constructor
```typescript
// ❌ WRONG
constructor(private userService: UserService) {} // Missing @inject()
```

### ✅ DO: All of These

1. Add `@injectable()` to every service and controller
2. Use `@inject(TOKENS.Service)` on all constructor parameters
3. Remove all manual instantiation exports
4. Use `container.resolve<Class>(TOKENS.Class)` in routes
5. Import only class types, not instances

---

## 🧪 Testing with DI

```typescript
// __tests__/user.service.test.ts
import { UserService } from "../user.service";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it("should get user info", async () => {
    const result = await userService.getUserInfo(1);
    expect(result).toBeDefined();
  });
});
```

---

## 📚 Further Reading

- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **Dependency Injection**: https://en.wikipedia.org/wiki/Dependency_injection
- **tsyringe Documentation**: https://github.com/Microsoft/tsyringe

---

## 🎓 Files to Reference

1. **Pattern Examples**: `src/app/auth/` (AuthService + AuthController)
2. **DI Setup**: `src/lib/di/container.ts`
3. **Tokens**: `src/lib/di/tokens.ts`
4. **All Routes**: `src/app/*/routes.ts`

---

## ✅ Implementation Status

- ✅ 7 Controllers using DI pattern
- ✅ 7 Services using DI pattern
- ✅ 7 Routes using container.resolve()
- ✅ All TOKENS defined
- ✅ All registrations in container
- ✅ TypeScript compilation success
- ✅ Ready for production

---

**Pattern Applied Across Entire Application** ✨

