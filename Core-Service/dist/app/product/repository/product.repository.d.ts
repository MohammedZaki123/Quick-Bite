import { Knex } from "knex";
import { Product } from "../entity/product.entity";
import { PaginationParams, FilterParams } from "../../../lib/http/pagination/cursor-pagination";
export declare function createProduct(data: Partial<Product>, conn?: Knex): Promise<Product>;
export declare function findProductsByRestaurant(restaurantId: number, params?: PaginationParams, filters?: FilterParams[]): Promise<Product[]>;
export declare function findProductById(id: number): Promise<Product | undefined>;
export declare function findProductByBranch(branchId: number, params?: PaginationParams, filters?: FilterParams[]): Promise<{
    id: any;
    name: any;
    description: any;
    imageUrl: any;
    restaurantId: any;
    categoryId: any;
    categoryName: any;
    price: any;
    stock: any;
    isAvailable: any;
}[]>;
export declare function updateProduct(id: number, data: Partial<Product>, conn?: Knex): Promise<Product>;
