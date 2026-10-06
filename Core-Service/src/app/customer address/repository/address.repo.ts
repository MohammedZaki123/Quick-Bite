import {db} from "../../../lib/knex/knex";
import {CustomerAddress} from "../entity/address.entity";

function toEntity(record: any): CustomerAddress {
    return new CustomerAddress({
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
]

export async function findAddressByCustomerID(userId: number, addressId: number): Promise<Boolean>{
    const result = await db.raw(`SELECT EXISTS (
   SELECT 1 FROM customer_addresses WHERE (user_id = ? AND id = ?))
   AS "exists"` ,[userId,addressId]);

    return result.rows[0].exists;


}

export async function createAddress(address: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const record = await db("customer_addresses").insert({
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

export async function getAddressesByUserId(userId: number): Promise<CustomerAddress[]> {
    const records = await db.select(ADDRESS_COLUMNS).from('customer_addresses').where('user_id', userId).orderBy('created_at', 'desc');
    // calling toEntity for each record to convert them into Address instances with camelCase convention
    return records.map(toEntity);
}

export async function updateAddress(address: Partial<CustomerAddress>, addressID: number): Promise<CustomerAddress> {
    // Build update object only with provided attributes
    const updateData: any = {};

    if (address.label !== undefined) updateData.label = address.label;
    if (address.country !== undefined) updateData.country = address.country;
    if (address.city !== undefined) updateData.city = address.city;
    if (address.street !== undefined) updateData.street = address.street;
    if (address.building !== undefined) updateData.building = address.building;
    if (address.apartmentNumber !== undefined) updateData.apartment_number = address.apartmentNumber;
    if (address.type !== undefined) updateData.type = address.type;
    if (address.lat !== undefined) updateData.lat = address.lat;
    if (address.lng !== undefined) updateData.lng = address.lng;
    if (address.isDefault !== undefined) updateData.is_default = address.isDefault;

    const record = await db("customer_addresses")
        .where('id', addressID)
        .update(updateData)
        .returning(ADDRESS_COLUMNS);

    return toEntity(record[0]);
}

export async function deleteAddress(addressID: number) {
    await db("customer_addresses").where('id', addressID)
        .delete();
}
export async function clearDefaultByUserId(userId: number): Promise<void> {
    await db("customer_addresses")
        .where("user_id", userId)
        .where("is_default", true)
        .update({is_default: false});
}

export async function findAddressById(id: number): Promise<CustomerAddress | undefined> {
    const row = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where("id", id)
        .first();

    return row ? toEntity(row) : undefined;
}




