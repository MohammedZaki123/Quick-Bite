"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRestaurantById = findRestaurantById;
exports.createRestaurant = createRestaurant;
exports.getAllRestaurants = getAllRestaurants;
exports.getRestaurants = getRestaurants;
exports.updateRestaurant = updateRestaurant;
exports.updatedRestaurantStatus = updatedRestaurantStatus;
const knex_1 = require("../../../lib/knex/knex");
const restaurant_entity_1 = require("../entity/restaurant.entity");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
function toEntity(record) {
    return new restaurant_entity_1.Restaurant({
        id: record.id,
        ownerId: record.owner_id,
        name: record.name,
        status: record.status,
        logoURL: record.logo_url,
        primaryCountry: record.primary_country,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        statusUpdatedAt: record.status_updated_at
    });
}
const RESTAURANT_COLUMNS = [
    "id", "owner_id", "name", "status", "created_at", "logo_url", "primary_country", "updated_at", "status_updated_at"
];
async function findRestaurantById(id) {
    const record = await knex_1.db.select(RESTAURANT_COLUMNS).from('restaurants').where('id', id).first();
    return record ? toEntity(record) : undefined;
}
async function createRestaurant(restaurant, conn = knex_1.db) {
    const record = await conn("restaurants").insert({
        owner_id: restaurant.ownerId,
        name: restaurant.name,
        status: restaurant.status,
        created_at: restaurant.createdAt,
        logo_url: restaurant.logoURL,
        primary_country: restaurant.primaryCountry,
        updated_at: restaurant.updatedAt,
        status_updated_at: restaurant.statusUpdatedAt
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(record[0]);
}
async function getAllRestaurants(params, filters) {
    // TODO: pagination will be added later
    let query = (0, knex_1.db)("restaurants").select(RESTAURANT_COLUMNS);
    query = (0, cursor_pagination_1.applyFilters)(query, filters);
    query = (0, cursor_pagination_1.applyCursorPagination)(query, params);
    const rows = await query;
    return rows.map(toEntity);
}
async function getRestaurants(restaurantIds) {
    //  TODO: SQL command objective -> get restaurant ID of branches that are near the specified lat and lng values
    //  TODO: create a raw sql command to get records of all restaurant IDs specified in input list
    const restaurants = await (0, knex_1.db)("restaurants").select(RESTAURANT_COLUMNS)
        .whereIn('id', restaurantIds).returning(RESTAURANT_COLUMNS);
    return restaurants.map(toEntity);
}
async function updateRestaurant(id, data) {
    const updatePayload = {
        updated_at: new Date()
    };
    if (data.name !== undefined)
        updatePayload.name = data.name;
    if (data.logoURL !== undefined)
        updatePayload.logo_url = data.logoURL;
    if (data.primaryCountry !== undefined)
        updatePayload.primary_country = data.primaryCountry;
    const [row] = await (0, knex_1.db)("restaurants").where("id", id).update(updatePayload).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}
async function updatedRestaurantStatus(id, status, conn = knex_1.db) {
    const now = new Date();
    const [row] = await conn("restaurants").where("id", id).update({
        status,
        updated_at: now,
        status_updated_at: now
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}
