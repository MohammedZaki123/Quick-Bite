import { User } from '../entity/user.entity';
import { Knex } from "knex";
export declare function getUserById(id: number): Promise<User | undefined>;
export declare function getUserByEmail(email: string): Promise<User | undefined>;
export declare function findUserExistsByEmailOrPhone(email: string, phone: string): Promise<Boolean>;
export declare function createUser(user: Partial<User>, conn?: Knex): Promise<User>;
export declare function updateUserPassword(userId: number, newPasswordHash: string): Promise<void>;
export declare function updateUser(userId: number, data: Partial<User>): Promise<User>;
