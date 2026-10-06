"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.findUserExistsByEmailOrPhone = findUserExistsByEmailOrPhone;
exports.createUser = createUser;
exports.updateUserPassword = updateUserPassword;
exports.updateUser = updateUser;
const user_entity_1 = require("../entity/user.entity");
const knex_1 = require("../../../lib/knex/knex");
function toEntity(record) {
    return new user_entity_1.User({
        id: record.id,
        email: record.email,
        phone: record.phone,
        name: record.name,
        passwordHash: record.password_hash,
        systemRole: record.system_role,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        deletedAt: record.deleted_at
    });
}
const USER_COLUMNS = [
    "id", "email", "phone", "name", "password_hash", "system_role", "created_at", "updated_at", "deleted_at"
];
async function getUserById(id) {
    const record = await knex_1.db.select(USER_COLUMNS).from('users').where('id', id).andWhere('deleted_at', null).first();
    return record ? toEntity(record) : undefined;
}
// for Login operation
async function getUserByEmail(email) {
    const record = await knex_1.db.select(USER_COLUMNS).from('users').where('email', email).andWhere('deleted_at', null).first();
    return record ? toEntity(record) : undefined;
}
async function findUserExistsByEmailOrPhone(email, phone) {
    const result = await knex_1.db.raw(`SELECT EXISTS (SELECT 1 FROM users WHERE (email = ? OR phone = ?) AND deleted_at IS NULL) 
    AS "exists"`, [email, phone]);
    return result.rows[0].exists;
}
async function createUser(user, conn = knex_1.db) {
    const record = await conn("users").insert({
        email: user.email,
        phone: user.phone,
        name: user.name,
        password_hash: user.passwordHash,
        system_role: user.systemRole,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    }).returning(USER_COLUMNS);
    return toEntity(record[0]);
}
async function updateUserPassword(userId, newPasswordHash) {
    await (0, knex_1.db)("users").where('id', userId).update({
        password_hash: newPasswordHash,
    });
}
async function updateUser(userId, data) {
    // Build update object only with provided attributes
    const record = await (0, knex_1.db)("users").
        where('id', userId).andWhere('deleted_at', null).
        update({ ...data,
        updated_at: new Date() }).
        returning(USER_COLUMNS);
    return toEntity(record[0]);
}
// export async function deleteUser(userId: number, trx?: Knex.Transaction) {
//     const query = trx || db;
//     await query("users").del().where('id',userId);
// }
