import { patchUserDto } from "../dto/user.dto";
import { SystemRole } from "../enums";
import { Knex } from "knex";
export interface CreateUserData {
    email: string;
    phone: string;
    name: string;
    password: string;
    role: SystemRole;
}
export declare class UserService {
    create: (data: CreateUserData, trx?: Knex | Knex.Transaction) => Promise<import("../entity/user.entity").User>;
    getUserInfo: (userId: number) => Promise<{
        id: number;
        email: string;
        phone: string;
        name: string;
        systemRole: SystemRole;
    }>;
    updateUserInfo: (userId: number, data: patchUserDto) => Promise<{
        id: number;
        email: string;
        phone: string;
        name: string;
        systemRole: SystemRole;
    }>;
    getAgentById: (id: number) => Promise<{
        id: number;
        name: string;
        phone: string;
    }>;
}
