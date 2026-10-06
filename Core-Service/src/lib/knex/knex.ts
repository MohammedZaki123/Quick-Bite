import knex from "knex";
import config from "./knexfile";

export const db = knex(config);

export async function pingDB(){
    await db.raw('SELECT 1');
}

// export async function down(knex: Knex): Promise<void> {
// return knex.schema.dropTable('users');
// }