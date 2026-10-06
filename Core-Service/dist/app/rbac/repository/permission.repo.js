"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionsByRoleName = getPermissionsByRoleName;
const permission_entity_1 = require("../entity/permission.entity");
const knex_1 = require("../../../lib/knex/knex");
function toEntity(data) {
    return new permission_entity_1.Permission({
        id: data.id,
        resource: data.resource,
        action: data.action,
        createdAt: data.created_at
    });
}
const PERMISSION_COLUMNS = ["id", "resource", "action", "created_at"];
async function getPermissionsByRoleName(roleName, trx) {
    const query = trx || knex_1.db;
    // Select p.resource, p.action from permissions p inner join
    // role_permissions rp on p.id = rp.permission_id
    // inner join roles r on rp.role_id = r.id
    // where r.name = roleName
    const rows = await query("permissions as p")
        .select("p.id", "p.resource", "p.action", "p.created_at")
        .join("role_permissions as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName);
    return rows.map(row => {
        const entity = toEntity(row);
        return `${entity.resource}:${entity.action}`;
    });
}
