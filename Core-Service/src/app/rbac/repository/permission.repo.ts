import {Permission} from "../entity/permission.entity";
import {db} from "../../../lib/knex/knex";
import {Knex} from "knex";

function toEntity(data: any){
    return new Permission({
        id: data.id,
        resource: data.resource,
        action: data.action,
        createdAt: data.created_at
    });
}

const PERMISSION_COLUMNS = ["id", "resource", "action", "created_at"];

export async function getPermissionsByRoleName(roleName: string, trx?: Knex.Transaction){
    const query = trx || db;

    // Select p.resource, p.action from permissions p inner join
    // role_permissions rp on p.id = rp.permission_id
    // inner join roles r on rp.role_id = r.id
    // where r.name = roleName

    const rows = await query("permissions as p")
        .select("p.id", "p.resource", "p.action", "p.created_at")
        .join("role_permissions as rp", "p.id", "rp.permission_id")
        .join("roles as r", "rp.role_id", "r.id")
        .where("r.name", roleName);

    return rows.map (row => {
        const entity = toEntity(row);
        return `${entity.resource}:${entity.action}`;
    })
}

