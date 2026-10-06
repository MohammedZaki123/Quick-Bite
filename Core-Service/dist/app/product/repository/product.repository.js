"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.findProductsByRestaurant = findProductsByRestaurant;
exports.findProductById = findProductById;
exports.findProductByBranch = findProductByBranch;
exports.updateProduct = updateProduct;
const knex_1 = require("../../../lib/knex/knex");
const product_entity_1 = require("../entity/product.entity");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
function toEntity(record) {
    return new product_entity_1.Product({
        id: record.id,
        name: record.name,
        description: record.description,
        imageUrl: record.image_url,
        restaurantId: record.restaurant_id,
        categoryId: record.category_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        deletedAt: record.deleted_at
    });
}
const PRODUCT_COLUMNS = ['id', 'name', 'description', 'image_url', 'restaurant_id', 'category_id', 'created_at', 'updated_at', 'deleted_at'];
async function createProduct(data, conn = knex_1.db) {
    const row = await conn("products").insert({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        restaurant_id: data.restaurantId,
        category_id: data.categoryId,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        deleted_at: data.deletedAt || null,
    }).returning(PRODUCT_COLUMNS);
    return toEntity(row[0]);
}
async function findProductsByRestaurant(restaurantId, params, filters) {
    let query = (0, knex_1.db)("products")
        .select(PRODUCT_COLUMNS)
        .where("restaurant_id", restaurantId)
        .whereNull("deleted_at");
    if (filters) {
        query = (0, cursor_pagination_1.applyFilters)(query, filters);
    }
    if (params) {
        query = (0, cursor_pagination_1.applyCursorPagination)(query, params);
    }
    const rows = await query;
    return rows.map(toEntity);
}
async function findProductById(id) {
    const row = await (0, knex_1.db)("products")
        .select(PRODUCT_COLUMNS)
        .where("id", id)
        .whereNull("deleted_at")
        .first();
    return row ? toEntity(row) : undefined;
}
async function findProductByBranch(branchId, params, filters) {
    let query = (0, knex_1.db)("products as p")
        .join("product_branch_details as pbd", "p.id", "pbd.product_id")
        .leftJoin("product_categories as pc", "p.category_id", "pc.id")
        .where("pbd.branch_id", branchId)
        .whereNull("p.deleted_at")
        .select("p.id", "p.name", "p.description", "p.image_url", "p.restaurant_id", "p.category_id", "pc.name as category_name", "pbd.price", "pbd.stock", "pbd.is_available");
    // if(filters) {
    //     query = applyFilters(query, filters);
    // }
    // if(params) {
    //     query = applyCursorPagination(query, params);
    // }
    const rows = await query;
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}
async function updateProduct(id, data, conn = knex_1.db) {
    const updatedPayload = {};
    if (data) {
        updatedPayload.updated_at = new Date();
    }
    if (data.name !== undefined)
        updatedPayload.name = data.name;
    if (data.description !== undefined)
        updatedPayload.description = data.description;
    if (data.imageUrl !== undefined)
        updatedPayload.image_url = data.imageUrl;
    if (data.categoryId !== undefined)
        updatedPayload.category_id = data.categoryId;
    const [row] = await conn("products").where("id", id).update(updatedPayload).returning(PRODUCT_COLUMNS);
    return toEntity(row);
}
