"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoleByName = findRoleByName;
exports.createRole = createRole;
const role_entity_1 = require("../entity/role.entity");
const knex_1 = require("../../../lib/knex/knex");
function toEntity(row) {
    return new role_entity_1.Role({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
}
const ROLE_COLUMNS = ["id", "name", "display_name", "description", "created_at", "updated_at"];
async function findRoleByName(name, trx) {
    const query = trx || knex_1.db;
    const record = await (0, knex_1.db)("roles").select(ROLE_COLUMNS).where('name', name).first();
    const role = record ? toEntity(record) : null;
    return role?.id;
}
// TODO: Creating Custom role feature
async function createRole(role) {
}
