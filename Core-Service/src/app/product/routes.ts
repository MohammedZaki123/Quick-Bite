import {ProductController} from "./controller/product.controller";
import {authenticate} from "../../lib/auth/guard";
import {requireRestaurantMember, requireBranchAccess, rbac} from "../../lib/auth/rbac";
import {Router} from "express"
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {idempotency} from "../../lib/idempotency/idempotency";
import {withCache} from "../../lib/cache/withCache";
import {requireInternalApiKey} from "../../lib/auth/api-key";

export const productRouter = Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);

productRouter.get('/restaurants/:restaurantId/categories',withCache(), productController.findCategories);
productRouter.get('/restaurants/:restaurantId/products',
    withCache(),
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:'read', allowSystemAdmin: true}),
    productController.findByRestaurant);
productRouter.get('/branches/:branchId/products', productController.findByBranch);
productRouter.get('/products/:id', productController.findById);
productRouter.post('/restaurants/:restaurantId/products',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:'create', allowSystemAdmin: true}),
    idempotency({strict: false}),
    productController.create);
productRouter.patch('/products/:id',
    authenticate,
    requireBranchAccess('branchId'),
    rbac({resource:"core:product", action:'update', allowSystemAdmin: true}),
    idempotency({strict: false}),
    productController.update);

productRouter.get('/internal/branches/:id/products', requireInternalApiKey, productController.findByBranchAndIds);
productRouter.post('/internal/branches/:id/reserve-stock', requireInternalApiKey, productController.reserveStock);
productRouter.post('/internal/branches/:id/undo-reserve-stock', requireInternalApiKey, productController.undoReserveStock);
