import { Knex } from "knex";
import { ProductCategory } from "../entity/product-category.entity";
import { PaginationParams, FilterParams } from "../../../lib/http/pagination/cursor-pagination";
export declare function findCategoriesByRestaurant(restaurantId: number, params?: PaginationParams, filters?: FilterParams[]): Promise<ProductCategory[]>;
export declare function findCategoryByName(restaurantId: number, name: string, conn?: Knex): Promise<ProductCategory | undefined>;
export declare function createCategory(category: Partial<ProductCategory>, conn?: Knex): Promise<ProductCategory>;
