import {db} from "../../../lib/knex/knex";
import {Restaurant} from '../entity/restaurant.entity'
import {Knex} from "knex";
import {
    applyCursorPagination,
    applyFilters,
    FilterParams,
    PaginationParams
} from "../../../lib/http/pagination/cursor-pagination";

function toEntity (record: any): Restaurant {
    return new Restaurant({
        id: record.id,
        ownerId: record.owner_id,
        name: record.name,
        status: record.status,
        logoURL: record.logo_url,
        primaryCountry: record.primary_country,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        statusUpdatedAt: record.status_updated_at
    })
}

const RESTAURANT_COLUMNS = [
    "id", "owner_id","name", "status","created_at", "logo_url", "primary_country" , "updated_at", "status_updated_at"
]

export async function findRestaurantById(id: number){
   const record = await db.select(RESTAURANT_COLUMNS).from('restaurants').where(
       'id', id
   ).first();

   return record? toEntity(record) : undefined;
}

export async function createRestaurant(restaurant: Partial<Restaurant>,  conn: Knex = db){
    const record = await conn("restaurants").insert(
        {
            owner_id: restaurant.ownerId,
            name : restaurant.name,
            status: restaurant.status,
            created_at: restaurant.createdAt,
            logo_url : restaurant.logoURL,
            primary_country: restaurant.primaryCountry,
            updated_at: restaurant.updatedAt,
            status_updated_at: restaurant.statusUpdatedAt
        }
    ).returning(RESTAURANT_COLUMNS);
    return toEntity(record[0]);
}

export async function getAllRestaurants(params: PaginationParams, filters: FilterParams[]){
    // TODO: pagination will be added later
    let query =  db("restaurants").select(RESTAURANT_COLUMNS);
    query = applyFilters(query,filters);
    query = applyCursorPagination(query,params);
    const rows = await query
    return rows.map(toEntity);
}

export async function getRestaurants(restaurantIds: number[]){
//  TODO: SQL command objective -> get restaurant ID of branches that are near the specified lat and lng values
//  TODO: create a raw sql command to get records of all restaurant IDs specified in input list
    const restaurants = await db("restaurants").select(RESTAURANT_COLUMNS)
        .whereIn('id', restaurantIds).returning(RESTAURANT_COLUMNS);

    return restaurants.map(toEntity)
}

export async function updateRestaurant(id: number, data: Partial<Restaurant>){
    const updatePayload: any = {
        updated_at: new Date()
    };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.logoURL !== undefined) updatePayload.logo_url = data.logoURL;
    if (data.primaryCountry !== undefined) updatePayload.primary_country = data.primaryCountry;

    const [row] = await db("restaurants").where("id", id).update(
        updatePayload).returning(RESTAURANT_COLUMNS);

    return toEntity(row);
}

export async function updatedRestaurantStatus(id: number, status: string, conn: Knex = db) {

    const now: Date = new Date()
    const [row] = await conn("restaurants").where("id", id).update({
        status,
        updated_at: now,
        status_updated_at: now
    }).returning(RESTAURANT_COLUMNS);

    return toEntity(row);
}



