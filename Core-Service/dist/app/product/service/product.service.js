"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const category_repository_1 = require("../repository/category.repository");
const enums_1 = require("../../user/enums");
const restaurant_repo_1 = require("../../restaurant/repository/restaurant.repo");
const errors_1 = require("../../restaurant/errors");
const product_repository_1 = require("../repository/product.repository");
const errors_2 = require("../../../lib/auth/errors");
const branch_repo_1 = require("../../branch/repository/branch.repo");
const errors_3 = require("../../branch/errors");
const errors_4 = require("../errors");
const knex_1 = require("../../../lib/knex/knex");
const product_details_repository_1 = require("../repository/product-details.repository");
const tsyringe_1 = require("tsyringe");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
const outbox_repo_1 = require("../../../lib/events/outbox.repo");
const event_types_1 = require("../../../lib/events/event-types");
let ProductService = class ProductService {
    findCategories = async (restaurantId, params, filters) => {
        const restaurant = (0, restaurant_repo_1.findRestaurantById)(restaurantId);
        if (!restaurant) {
            throw errors_1.RestaurantDoesNotExist;
        }
        const categories = await (0, category_repository_1.findCategoriesByRestaurant)(restaurantId);
        if (params) {
            return (0, cursor_pagination_1.buildPaginationResult)(categories, params.limit, params.sortBy);
        }
        return { data: categories, meta: { nextCursor: null, hasMore: false, count: categories.length } };
    };
    findByRestaurant = async (restaurantId, role, userId, params, filters) => {
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(restaurantId);
        if (!restaurant)
            throw errors_1.RestaurantDoesNotExist;
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw errors_2.NotAuthorized;
        }
        const products = await (0, product_repository_1.findProductsByRestaurant)(restaurantId);
        if (params) {
            return (0, cursor_pagination_1.buildPaginationResult)(products, params.limit, params.sortBy);
        }
        return { data: products, meta: { nextCursor: null, hasMore: false, count: products.length } };
    };
    findByBranch = async (branchId, params, filters) => {
        const branch = await (0, branch_repo_1.findBranchById)(branchId);
        if (!branch) {
            throw errors_3.BranchNotFound;
        }
        return (0, product_repository_1.findProductByBranch)(branchId);
        // const products = await findProductByBranch(branchId);
        // if(params) {
        //     return buildPaginationResult(products, params.limit, params.sortBy);
        // }
        // return {data: products, meta: {nextCursor: null, hasMore: false, count: products.length}};
    };
    findById = async (id) => {
        const product = await (0, product_repository_1.findProductById)(id);
        if (!product) {
            throw errors_4.ProductDoesNotExist;
        }
        return product;
    };
    create = async (restaurantId, role, userId, data) => {
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(restaurantId);
        if (!restaurant) {
            throw errors_1.RestaurantDoesNotExist;
        }
        // if(role !== SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)){
        //     throw NotAuthorized;
        // }
        // TODO: Transaction involve: createCategory
        //  if categoryName value exists inside data DTO
        //     call getCategoryExistsByName from category.repository
        //     if exists take returned object id and add it to new product Object
        //     if not: call createCategory function from category.repository
        const now = new Date();
        const trx = await knex_1.db.transaction();
        try {
            let categoryId = undefined;
            if (data.categoryName !== undefined) {
                let category = await (0, category_repository_1.findCategoryByName)(restaurantId, data.categoryName);
                // in both cases categoryId variable will be set to the new or the existed
                if (!category) {
                    category = await (0, category_repository_1.createCategory)({
                        restaurantId: restaurantId,
                        name: data.categoryName,
                        createdAt: now,
                        updatedAt: now
                    }, trx);
                }
                categoryId = category.id;
            }
            const product = await (0, product_repository_1.createProduct)({
                name: data.name,
                description: data.description ?? "",
                imageUrl: data.imageUrl ?? "",
                restaurantId: restaurantId,
                categoryId: categoryId ?? null,
                createdAt: now,
                updatedAt: now,
            }, trx);
            await trx.commit();
            return product;
        }
        catch (error) {
            trx.rollback();
            throw error;
        }
    };
    update = async (productId, data, role, userId, branchId) => {
        const now = new Date();
        const product = await (0, product_repository_1.findProductById)(productId);
        if (!product) {
            throw errors_4.ProductDoesNotExist;
        }
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(product.restaurantId);
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)) {
            throw errors_2.NotAuthorized;
        }
        let categoryId = undefined;
        let category;
        if (data.categoryName) {
            category = await (0, category_repository_1.findCategoryByName)(product.restaurantId, data.categoryName);
            if (!category) {
                category = await (0, category_repository_1.createCategory)({
                    restaurantId: product.restaurantId,
                    name: data.categoryName,
                    createdAt: now,
                    updatedAt: now
                });
            }
            categoryId = category.id;
        }
        const updatedProduct = await (0, product_repository_1.updateProduct)(productId, {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categoryId,
        });
        let branchDetails;
        // More on DB Transactions later
        const trx = await knex_1.db.transaction();
        if (branchId) {
            try {
                const entity = await (0, product_details_repository_1.updateBranchDetails)(branchId, productId, {
                    price: data.price,
                    stock: data.stock,
                    isAvailable: data.isAvailable,
                }, trx);
                if (data.price !== undefined) {
                    await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                        aggregateType: "product_branch_details",
                        aggregateId: `${branchId}:${productId}`,
                        eventType: event_types_1.EVENT_TYPES.PRODUCT_PRICE_CHANGED,
                        payload: { branchId, productId, newPrice: entity.price },
                    });
                }
                if (data.stock !== undefined || data.isAvailable !== undefined) {
                    await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                        aggregateType: "product_branch_details",
                        aggregateId: `${branchId}:${productId}`,
                        eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                        payload: {
                            branchId,
                            productId,
                            newStock: entity.stock,
                            isAvailable: entity.isAvailable,
                        },
                    });
                }
                await trx.commit();
                branchDetails = entity;
            }
            catch (error) {
                await trx.rollback();
                throw error;
            }
        }
        return { result: { updatedProduct, category, branchDetails } };
    };
    /**
     * Atomically decrements branch stock for each item. Locks the rows FOR UPDATE
     * and emits product.stock.changed per decrement so order-service invalidates
     * its cache.
     */
    reserveStock = async (branchId, items) => {
        // TODO: Function Logic Algorithm Explained
        //  So order service sends a request to reserve stock for multiple items, we need to make sure that either all items are reserved or none of them are reserved to avoid partial reservation which can lead to bad user experience
        //  and also we need to make sure that the stock is not oversold so we need to check the stock before reserving it
        //  and if the stock is not enough we need to return the offending items with their available stock and requested quantity
        // sanitize and validate input for each item (productId and quantity should be positive integers)
        const sanitized = items
            .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) }))
            .filter((it) => Number.isInteger(it.productId) && Number.isInteger(it.quantity) && it.quantity > 0);
        if (sanitized.length !== items.length) {
            throw errors_4.InvalidReserveItemsError;
        }
        const productIds = sanitized.map((i) => i.productId);
        const trx = await knex_1.db.transaction();
        try {
            // select stock for each product in the branch with FOR UPDATE to lock the rows until we finish the reservation process
            const rows = await trx("product_branch_details")
                .where("branch_id", branchId)
                .whereIn("product_id", productIds)
                .select("product_id", "stock", "is_available")
                .forUpdate();
            // creating a map of productId to stock and availability for easy lookup
            const byProduct = new Map();
            for (const r of rows)
                byProduct.set(Number(r.product_id), { stock: r.stock, isAvailable: r.is_available });
            // checking if the requested quantity is more than the available stock for any item,
            // if yes we need to make a rollback the transaction and return the unavailableProducts items with their available stock and requested quantity
            const unavailableProducts = [];
            const availableProducts = [];
            for (const it of sanitized) {
                const current = byProduct.get(it.productId);
                if (!current || !current.isAvailable) {
                    unavailableProducts.push({ productId: it.productId, requested: it.quantity, available: 0 });
                    continue;
                }
                if (current.stock < it.quantity) {
                    unavailableProducts.push({ productId: it.productId, requested: it.quantity, available: current.stock });
                    continue;
                }
                availableProducts.push({ productId: it.productId, newStock: current.stock - it.quantity });
            }
            if (unavailableProducts.length > 0) {
                throw (0, errors_4.outOfStockError)(unavailableProducts);
            }
            // In order to avoid N + 1 problem we will batch update the stock for all items in a single query
            // and emitting product.stock.changed event for each item to invalidate the cache in order service
            // and also pushing the applied changes to an array to be returned in the response
            await bulkUpdateStock(trx, branchId, availableProducts);
            // Batch insert outbox events
            for (const a of availableProducts) {
                await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${a.productId}`,
                    eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: { branchId, productId: a.productId, newStock: a.newStock },
                });
            }
            await trx.commit();
            return { ok: true, applied: availableProducts };
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    };
    findByBranchAndIds = async (branchId, productIds) => {
        // TODO: should be placed in repo layer of product details but for now we can keep it here to
        //  avoid creating new function in repo layer that is only used once and
        //  also to avoid circular dependency between product details repo and product repo
        if (productIds.length === 0)
            return [];
        const rows = await (0, knex_1.db)("product_branch_details as pbd")
            .join("products as p", "p.id", "pbd.product_id")
            .where("pbd.branch_id", branchId)
            .whereIn("pbd.product_id", productIds)
            .whereNull("p.deleted_at")
            .select("pbd.product_id", "p.name", "p.image_url", "pbd.price", "pbd.stock", "pbd.is_available");
        return rows.map((r) => ({
            productId: r.product_id,
            name: r.name,
            imageUrl: r.image_url,
            price: r.price,
            stock: r.stock,
            isAvailable: r.is_available,
        }));
    };
    undoReserveStock = async (branchId, items) => {
        const sanitized = items
            .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) }))
            .filter((it) => Number.isInteger(it.productId) && Number.isInteger(it.quantity) && it.quantity > 0);
        if (sanitized.length !== items.length) {
            throw errors_4.InvalidReserveItemsError;
        }
        const productIds = sanitized.map((i) => i.productId);
        if (productIds.length === 0)
            return { ok: true, applied: [] };
        const trx = await knex_1.db.transaction();
        try {
            const rows = await trx("product_branch_details")
                .where("branch_id", branchId)
                .whereIn("product_id", productIds)
                .select("product_id", "stock")
                .forUpdate();
            const byProduct = new Map();
            for (const r of rows)
                byProduct.set(Number(r.product_id), r.stock);
            const updates = [];
            for (const it of sanitized) {
                const currentStock = byProduct.get(it.productId);
                if (currentStock === undefined)
                    continue;
                updates.push({ productId: it.productId, newStock: currentStock + it.quantity });
            }
            if (updates.length > 0) {
                // Batch update stock
                await bulkUpdateStock(trx, branchId, updates);
                // Batch insert outbox events
                for (const u of updates) {
                    await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                        aggregateType: "product_branch_details",
                        aggregateId: `${branchId}:${u.productId}`,
                        eventType: event_types_1.EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                        payload: { branchId, productId: u.productId, newStock: u.newStock },
                    });
                }
            }
            await trx.commit();
            return { ok: true, applied: updates };
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    };
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, tsyringe_1.injectable)()
], ProductService);
async function bulkUpdateStock(trx, branchId, applied) {
    if (applied.length === 0)
        return;
    const placeholders = applied.map(() => "(?, ?)").join(",");
    const bindings = [];
    for (const a of applied)
        bindings.push(a.productId, a.newStock);
    bindings.push(branchId);
    // Casts are required: parameters inside VALUES default to `text`, which
    // breaks `pbd.product_id (bigint) = v.product_id` and `SET stock (int) = v.new_stock`.
    await trx.raw(`UPDATE product_branch_details AS pbd
         SET stock = v.new_stock::int
         FROM (VALUES ${placeholders}) AS v(product_id, new_stock)
         WHERE pbd.branch_id = ? AND pbd.product_id = v.product_id::bigint`, bindings);
}
