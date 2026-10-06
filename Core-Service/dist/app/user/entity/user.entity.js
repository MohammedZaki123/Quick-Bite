"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    email;
    phone;
    name;
    passwordHash;
    systemRole;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.phone = data.phone;
        this.name = data.name;
        this.passwordHash = data.passwordHash;
        this.systemRole = data.systemRole;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt || null;
    }
}
exports.User = User;
