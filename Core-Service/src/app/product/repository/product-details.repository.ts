import {db} from "../../../lib/knex/knex";
import {ProductBranchDetails} from "../entity/product-branch-details.entity";
import {Knex} from "knex";

const PBD_COLUMNS = [
    'id', 'branch_id', 'product_id', 'price', 'stock', 'is_available'
]

function toEntity(row: any) {
    return new ProductBranchDetails({
        id: row.id,
        branchId: row.branch_id,
        productId: row.product_id,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    })
}

export async function updateBranchDetails(branchId: number, productId: number, data: Partial<ProductBranchDetails>,  conn: Knex = db) {
    const updatedPayload: any = {};
    if(data.price !== undefined) updatedPayload.price = data.price;
    if(data.stock !== undefined) updatedPayload.stock = data.stock;
    if(data.isAvailable !== undefined) updatedPayload.is_available = data.isAvailable

    const [row] = await db("product_branch_details")
        .where("branch_id", branchId)
        .where("product_id", productId)
        .update(updatedPayload)
        .returning(PBD_COLUMNS);
    return toEntity(row);
}