"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_TYPES = void 0;
/**
 * Canonical event type constants. The order-service's bindings
 * (`product.*`, `branch.*`, `restaurant.*`, `rbac.*`) must stay in sync.
 */
exports.EVENT_TYPES = {
    PRODUCT_STOCK_CHANGED: "product.stock.changed",
    PRODUCT_PRICE_CHANGED: "product.price.changed",
    BRANCH_UPDATED: "branch.updated",
    BRANCH_DEACTIVATED: "branch.deactivated",
    RESTAURANT_SUSPENDED: "restaurant.suspended",
    RBAC_PERMISSIONS_CHANGED: "rbac.permissions_changed",
};
