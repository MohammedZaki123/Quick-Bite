import { Knex } from "knex";
export declare function getPermissionsByRoleName(roleName: string, trx?: Knex.Transaction): Promise<string[]>;
