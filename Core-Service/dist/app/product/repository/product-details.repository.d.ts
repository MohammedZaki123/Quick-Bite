import { ProductBranchDetails } from "../entity/product-branch-details.entity";
import { Knex } from "knex";
export declare function updateBranchDetails(branchId: number, productId: number, data: Partial<ProductBranchDetails>, conn?: Knex): Promise<ProductBranchDetails>;
