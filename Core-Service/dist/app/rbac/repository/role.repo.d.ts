import { Role } from "../entity/role.entity";
import { Knex } from "knex";
export declare function findRoleByName(name: string, trx?: Knex.Transaction): Promise<number | undefined>;
export declare function createRole(role: Partial<Role>): Promise<void>;
