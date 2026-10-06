"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCategoriesByRestaurant = findCategoriesByRestaurant;
exports.findCategoryByName = findCategoryByName;
exports.createCategory = createCategory;
const knex_1 = require("../../../lib/knex/knex");
const product_category_entity_1 = require("../entity/product-category.entity");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
function toEntity(record) {
    return new product_category_entity_1.ProductCategory({
        id: record.id,
        restaurantId: record.restaurant_id,
        name: record.name,
        createdAt: record.created_at,
        updatedAt: record.updated_at
    });
}
const CATEGORY_COLUMNS = [
    "id", "restaurant_id", "name", "created_at", "updated_at"
];
async function findCategoriesByRestaurant(restaurantId, params, filters) {
    let query = knex_1.db.select(CATEGORY_COLUMNS).from("product_categories")
        .where("restaurant_id", restaurantId);
    if (filters) {
        query = (0, cursor_pagination_1.applyFilters)(query, filters);
    }
    if (params) {
        query = (0, cursor_pagination_1.applyCursorPagination)(query, params);
    }
    const records = await query;
    return records.map(toEntity);
}
async function findCategoryByName(restaurantId, name, conn = knex_1.db) {
    const row = await conn("product_categories")
        .select(CATEGORY_COLUMNS)
        .where("restaurant_id", restaurantId)
        .where("name", name)
        .first();
    return row ? toEntity(row) : undefined;
}
async function createCategory(category, conn = knex_1.db) {
    const [row] = await conn("product_categories").insert({
        restaurant_id: category.restaurantId,
        name: category.name,
        created_at: category.createdAt,
        updated_at: category.updatedAt
    }).returning(CATEGORY_COLUMNS);
    return toEntity(row);
}
