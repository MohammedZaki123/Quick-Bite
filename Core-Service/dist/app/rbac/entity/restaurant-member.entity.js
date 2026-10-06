"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantMember = void 0;
const enums_1 = require("../enums");
class RestaurantMember {
    id;
    userId;
    restaurantId;
    roleId;
    status;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.restaurantId = data.restaurantId;
        this.roleId = data.roleId;
        this.status = data.status ?? enums_1.MemberStatus.ACTIVE;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
exports.RestaurantMember = RestaurantMember;
