"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCategory = void 0;
class ProductCategory {
    id;
    restaurantId;
    name;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.name = data.name;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
exports.ProductCategory = ProductCategory;
