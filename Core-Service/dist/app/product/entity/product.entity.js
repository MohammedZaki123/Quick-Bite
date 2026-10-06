"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    id;
    restaurantId;
    categoryId;
    name;
    description;
    imageUrl;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.restaurantId = data.restaurantId;
        this.categoryId = data.categoryId ?? null;
        this.name = data.name;
        this.description = data.description;
        this.imageUrl = data.imageUrl;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deletedAt = data.deletedAt ?? null;
    }
}
exports.Product = Product;
