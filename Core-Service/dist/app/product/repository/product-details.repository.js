"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchDetails = updateBranchDetails;
const knex_1 = require("../../../lib/knex/knex");
const product_branch_details_entity_1 = require("../entity/product-branch-details.entity");
const PBD_COLUMNS = [
    'id', 'branch_id', 'product_id', 'price', 'stock', 'is_available'
];
function toEntity(row) {
    return new product_branch_details_entity_1.ProductBranchDetails({
        id: row.id,
        branchId: row.branch_id,
        productId: row.product_id,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    });
}
async function updateBranchDetails(branchId, productId, data, conn = knex_1.db) {
    const updatedPayload = {};
    if (data.price !== undefined)
        updatedPayload.price = data.price;
    if (data.stock !== undefined)
        updatedPayload.stock = data.stock;
    if (data.isAvailable !== undefined)
        updatedPayload.is_available = data.isAvailable;
    const [row] = await (0, knex_1.db)("product_branch_details")
        .where("branch_id", branchId)
        .where("product_id", productId)
        .update(updatedPayload)
        .returning(PBD_COLUMNS);
    return toEntity(row);
}
