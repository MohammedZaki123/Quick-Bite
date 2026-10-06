"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
class Restaurant {
    id;
    ownerId;
    name;
    status;
    logoURL;
    primaryCountry;
    createdAt;
    updatedAt;
    statusUpdatedAt;
    constructor(data) {
        this.id = data.id;
        this.ownerId = data.ownerId;
        this.name = data.name;
        this.status = data.status;
        this.logoURL = data.logoURL ?? "";
        this.primaryCountry = data.primaryCountry;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.statusUpdatedAt = data.statusUpdatedAt;
    }
}
exports.Restaurant = Restaurant;
