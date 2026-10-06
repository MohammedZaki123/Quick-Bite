/**
 * Canonical event type constants. The order-service's bindings
 * (`product.*`, `branch.*`, `restaurant.*`, `rbac.*`) must stay in sync.
 */
export declare const EVENT_TYPES: {
    readonly PRODUCT_STOCK_CHANGED: "product.stock.changed";
    readonly PRODUCT_PRICE_CHANGED: "product.price.changed";
    readonly BRANCH_UPDATED: "branch.updated";
    readonly BRANCH_DEACTIVATED: "branch.deactivated";
    readonly RESTAURANT_SUSPENDED: "restaurant.suspended";
    readonly RBAC_PERMISSIONS_CHANGED: "rbac.permissions_changed";
};
export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
