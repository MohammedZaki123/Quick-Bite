import { SystemRole } from "../enums";
export declare class User {
    id: number;
    email: string;
    phone: string;
    name: string;
    passwordHash: string;
    systemRole: SystemRole;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    constructor(data: Partial<User>);
}
