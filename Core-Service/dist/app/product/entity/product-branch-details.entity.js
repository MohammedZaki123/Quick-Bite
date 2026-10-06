"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBranchDetails = void 0;
class ProductBranchDetails {
    id;
    productId;
    branchId;
    stock;
    isAvailable;
    price;
    constructor(data) {
        this.id = data.id;
        this.productId = data.productId;
        this.branchId = data.branchId;
        this.stock = data.stock;
        this.isAvailable = data.isAvailable;
        this.price = data.price;
    }
}
exports.ProductBranchDetails = ProductBranchDetails;
