import {Role} from "../entity/role.entity";
import {db} from "../../../lib/knex/knex";
import {Knex} from "knex";

function toEntity (row: any){
    return new Role({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
}

const ROLE_COLUMNS = ["id", "name", "display_name", "description", "created_at", "updated_at"];
export async function findRoleByName(name: string,  trx?: Knex.Transaction) {
    const query = trx || db;
    const record = await db("roles").select(ROLE_COLUMNS).where('name', name).first();

    const role = record ? toEntity(record) : null;

    return role?.id;
}


// TODO: Creating Custom role feature
export async function createRole(role: Partial<Role>){

}



