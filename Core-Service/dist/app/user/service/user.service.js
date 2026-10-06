"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repo_1 = require("../repository/user.repo");
const errors_1 = require("../errors");
const tsyringe_1 = require("tsyringe");
const enums_1 = require("../enums");
const utils_1 = require("../../auth/utils");
let UserService = class UserService {
    create = async (data, trx) => {
        const exists = await (0, user_repo_1.findUserExistsByEmailOrPhone)(data.email, data.phone);
        if (exists) {
            throw errors_1.UserNotFoundError;
        }
        let hashedPassword;
        if (data.role !== enums_1.SystemRole.RESTAURANT_USER) {
            hashedPassword = await (0, utils_1.hashPassword)(data.password);
        }
        const now = new Date();
        return await (0, user_repo_1.createUser)({
            email: data.email,
            phone: data.phone,
            name: data.name,
            passwordHash: hashedPassword || data.password,
            systemRole: data.role,
            createdAt: now,
            updatedAt: now,
        }, trx);
    };
    getUserInfo = async (userId) => {
        const user = await (0, user_repo_1.getUserById)(userId);
        if (!user) {
            throw errors_1.UserNotFoundError;
        }
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            systemRole: user.systemRole,
        };
    };
    updateUserInfo = async (userId, data) => {
        //    user id surely exists because it is extracted from token stored in cookie after login
        //     call findUserById to check if user is soft deleted or not
        const u = await (0, user_repo_1.getUserById)(userId);
        if (!u) {
            throw errors_1.UserNotFoundError;
        }
        const user = await (0, user_repo_1.updateUser)(userId, data);
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            systemRole: user.systemRole,
        };
    };
    // deleteUser = async (userId: number, trx?: Knex.Transaction) => {
    //     await deleteUser(userId, trx);
    // }
    getAgentById = async (id) => {
        const user = await (0, user_repo_1.getUserById)(id);
        if (!user)
            throw errors_1.UserNotFoundError;
        if (user.systemRole !== enums_1.SystemRole.DELIVERY_AGENT) {
            // Use UserNotFoundError to avoid enumeration of other user types.
            throw errors_1.UserNotFoundError;
        }
        return { id: user.id, name: user.name, phone: user.phone };
    };
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, tsyringe_1.injectable)()
], UserService);
