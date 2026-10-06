"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAddressByCustomerID = findAddressByCustomerID;
exports.createAddress = createAddress;
exports.getAddressesByUserId = getAddressesByUserId;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
exports.clearDefaultByUserId = clearDefaultByUserId;
exports.findAddressById = findAddressById;
const knex_1 = require("../../../lib/knex/knex");
const address_entity_1 = require("../entity/address.entity");
function toEntity(record) {
    return new address_entity_1.CustomerAddress({
        id: record.id,
        userId: Number(record.user_id),
        label: record.label,
        country: record.country,
        city: record.city,
        street: record.street,
        building: record.building,
        apartmentNumber: record.apartment_number,
        type: record.type,
        lat: parseFloat(record.lat),
        lng: parseFloat(record.lng),
        isDefault: record.is_default,
        createdAt: record.created_at
    });
}
const ADDRESS_COLUMNS = [
    "id", "user_id", "label", "country", "city", "street", "building",
    "apartment_number", "type", "lat", "lng", "is_default"
];
async function findAddressByCustomerID(userId, addressId) {
    const result = await knex_1.db.raw(`SELECT EXISTS (
   SELECT 1 FROM customer_addresses WHERE (user_id = ? AND id = ?))
   AS "exists"`, [userId, addressId]);
    return result.rows[0].exists;
}
async function createAddress(address) {
    const record = await (0, knex_1.db)("customer_addresses").insert({
        user_id: address.userId,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartment_number: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        is_default: address.isDefault,
    }).returning(ADDRESS_COLUMNS);
    return toEntity(record[0]);
}
async function getAddressesByUserId(userId) {
    const records = await knex_1.db.select(ADDRESS_COLUMNS).from('customer_addresses').where('user_id', userId).orderBy('created_at', 'desc');
    // calling toEntity for each record to convert them into Address instances with camelCase convention
    return records.map(toEntity);
}
async function updateAddress(address, addressID) {
    // Build update object only with provided attributes
    const updateData = {};
    if (address.label !== undefined)
        updateData.label = address.label;
    if (address.country !== undefined)
        updateData.country = address.country;
    if (address.city !== undefined)
        updateData.city = address.city;
    if (address.street !== undefined)
        updateData.street = address.street;
    if (address.building !== undefined)
        updateData.building = address.building;
    if (address.apartmentNumber !== undefined)
        updateData.apartment_number = address.apartmentNumber;
    if (address.type !== undefined)
        updateData.type = address.type;
    if (address.lat !== undefined)
        updateData.lat = address.lat;
    if (address.lng !== undefined)
        updateData.lng = address.lng;
    if (address.isDefault !== undefined)
        updateData.is_default = address.isDefault;
    const record = await (0, knex_1.db)("customer_addresses")
        .where('id', addressID)
        .update(updateData)
        .returning(ADDRESS_COLUMNS);
    return toEntity(record[0]);
}
async function deleteAddress(addressID) {
    await (0, knex_1.db)("customer_addresses").where('id', addressID)
        .delete();
}
async function clearDefaultByUserId(userId) {
    await (0, knex_1.db)("customer_addresses")
        .where("user_id", userId)
        .where("is_default", true)
        .update({ is_default: false });
}
async function findAddressById(id) {
    const row = await (0, knex_1.db)("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where("id", id)
        .first();
    return row ? toEntity(row) : undefined;
}
