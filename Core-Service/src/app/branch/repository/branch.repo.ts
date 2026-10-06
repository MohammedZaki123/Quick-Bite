import {db} from "../../../lib/knex/knex";
import {Branch} from "../entity/branch.entity";
import {Knex} from "knex";
import {PaginationParams, applyCursorPagination, FilterParams, applyFilters} from "../../../lib/http/pagination/cursor-pagination";

function toEntity (record: any){
    return new Branch({
        id: record.id,
        restaurantId : record.restaurant_id,
        countryCode: record.country_code,
        addressText: record.address_text,
        label: record.label,
        lat: record.lat,
        lng: record.lng,
        isActive: record.is_active,
        opensAt: record.opens_at,
        closesAt: record.closes_at,
        acceptOrders: record.accept_orders,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        deliveryRadius: record.delivery_radius,
        deliveryFee: record.delivery_fee,
        currency: record.currency,
        commission: record.commission,
    })
}

const BRANCH_COLUMNS = [
    "id", "restaurant_id", "lat", "lng", "country_code",
    "label", "is_active", "opens_at", "closes_at", "address_text",
    "accept_orders", "created_at", "updated_at", "currency", "commission", "delivery_radius", "delivery_fee", "location"
]

export async function findBranchById(id: number){
    const record = await db.select(BRANCH_COLUMNS).from("restaurant_branches").where(
        'id', id
    ).first();

    return record? toEntity(record): undefined;
}

export async function createBranch(branch: Partial<Branch>, conn: Knex = db){
    const record = await conn("restaurant_branches").insert(
        {
            restaurant_id : branch.restaurantId,
            country_code: branch.countryCode,
            address_text: branch.addressText,
            label: branch.label,
            lat: branch.lat,
            lng: branch.lng,
            is_active: branch.isActive,
            opens_at: branch.opensAt,
            closes_at: branch.closesAt,
            accept_orders: branch.acceptOrders,
            created_at: new Date(),
            updated_at: new Date(),
            delivery_radius: branch.deliveryRadius,
            currency: branch.currency,
            commission: branch.commission,
        }
    ).returning(BRANCH_COLUMNS);

    return toEntity(record[0]);
}

export async function findNearByBranches(lat: number, lng: number, params?: PaginationParams, filters?: FilterParams[]){
     let query = db("restaurant_branches as b")
         .join("restaurants as r", "b.restaurant_id", "r.id")
         .select("b.id", "b.restaurant_id", "b.address_text", "b.label", "b.lat", "b.lng", "b.is_active", "b.accept_orders", "b.currency", "b.delivery_radius", "r.name as restaurant_name", "r.logo_url")
         .where("b.is_active", true)
         .where("r.status", "active")
         .whereRaw(`ST_DWithin(ST_MakePoint(?, ?)::geography, ST_MakePoint(b.lng, b.lat)::geography, b.delivery_radius * 1000)`, [lng, lat]);

    //  if(filters) {
    //      query = applyFilters(query, filters);
    //  }

    //  if(params) {
    //      query = applyCursorPagination(query, params);
    //  }

     const result = await query;

     return result.map((row: any) => ({
        id: row.id,
        restaurantId: row.restaurant_id,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        acceptOrders: row.accept_orders,
        currency: row.currency,
        deliveryRadius: row.delivery_radius,
        restaurantName: row.restaurant_name,
        logoUrl: row.logo_url,
    }));
}

export async function getBranchesByRestaurantId(restaurantID: number, params?: PaginationParams, filters?: FilterParams[]){
    let query = db.select(BRANCH_COLUMNS).from('restaurant_branches').where('restaurant_id', restaurantID);

    if(filters) {
        query = applyFilters(query, filters);
    }

    if(params) {
        query = applyCursorPagination(query, params);
    }

    const records = await query;
    return records.map(toEntity);
}

export async function updateBranch(branchId: number, data: Partial<Branch>, conn: Knex = db){
    const updatedPayload: any = {
        updated_at: new Date()
    };

    // check every attribute if it exists in input data
    if(data.lat !== undefined) updatedPayload.lat = data.lat;
    if(data.lng !== undefined) updatedPayload.lng = data.lng;
    if(data.label !== undefined) updatedPayload.label = data.label
    if(data.opensAt !== undefined) updatedPayload.opens_at = data.opensAt;
    if(data.closesAt !== undefined) updatedPayload.closes_at = data.closesAt;
    if(data.acceptOrders !== undefined) updatedPayload.accept_orders = data.acceptOrders;
    if(data.addressText !== undefined) updatedPayload.address_text = data.addressText;
    if(data.currency !== undefined) updatedPayload.currency = data.currency;
    if(data.deliveryRadius !== undefined) updatedPayload.delivery_radius = data.deliveryRadius;


    const record = await conn("restaurant_branches").where('id', branchId).update(updatedPayload).returning(BRANCH_COLUMNS);

    return toEntity(record[0]);
}

export async function updateBranchStatus(branchId: number, data: Partial<Branch>, conn: Knex = db){
    const updatedPayload: any = {
        updated_at: new Date()
    };
    // check if commission and isActive exist in input data or not

    if(data.commission !== undefined) updatedPayload.commission = data.commission
    if(data.isActive !== undefined) updatedPayload.is_active = data.isActive

    const record = await conn('restaurant_branches').where('id', branchId).update(updatedPayload).returning(BRANCH_COLUMNS);

    return toEntity(record[0]);
}

export async function findBranchesByIds(ids: number[]): Promise<Branch[]> {
    if (ids.length === 0) return [];
    const rows = await db("restaurant_branches").select(BRANCH_COLUMNS).whereIn("id", ids);
    return rows.map(toEntity);
}



