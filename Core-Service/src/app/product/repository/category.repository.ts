import {db} from "../../../lib/knex/knex";
import {Knex} from "knex";
import {ProductCategory} from "../entity/product-category.entity";
import {PaginationParams, applyCursorPagination, FilterParams, applyFilters} from "../../../lib/http/pagination/cursor-pagination";
function toEntity (record: any) {
    return new ProductCategory({
        id: record.id,
        restaurantId: record.restaurant_id,
        name: record.name,
        createdAt: record.created_at,
        updatedAt: record.updated_at
    })
}

const CATEGORY_COLUMNS = [
    "id", "restaurant_id", "name","created_at","updated_at"
]


export async function findCategoriesByRestaurant (restaurantId: number, params?: PaginationParams, filters?: FilterParams[]) {
    let query = db.select(CATEGORY_COLUMNS).from("product_categories")
        .where("restaurant_id", restaurantId);

    if(filters) {
        query = applyFilters(query, filters);
    }

    if(params) {
        query = applyCursorPagination(query, params);
    }

    const records = await query;
    return records.map(toEntity);
}

export async function findCategoryByName(restaurantId: number, name: string, conn: Knex = db) {
    const row = await conn("product_categories")
        .select(CATEGORY_COLUMNS)
        .where("restaurant_id", restaurantId)
        .where("name", name)
        .first();
    return row ? toEntity(row) : undefined;
}

export async function createCategory(category: Partial<ProductCategory>, conn: Knex = db){
    const [row] = await conn("product_categories").insert({
        restaurant_id: category.restaurantId,
        name: category.name,
        created_at: category.createdAt,
        updated_at: category.updatedAt
    }).returning(CATEGORY_COLUMNS);
    return toEntity(row);
}

