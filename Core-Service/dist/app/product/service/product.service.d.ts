import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
import { BranchProductRow, ReserveStockInput, ReserveStockResult } from "../types";
export declare class ProductService {
    findCategories: (restaurantId: number, params?: PaginationParams, filters?: FilterParams[]) => Promise<{
        data: import("../entity/product-category.entity").ProductCategory[];
        meta: import("../../../lib/http/pagination/cursor-pagination").PaginationMeta;
    }>;
    findByRestaurant: (restaurantId: number, role: SystemRole, userId: number, params?: PaginationParams, filters?: FilterParams[]) => Promise<{
        data: import("../entity/product.entity").Product[];
        meta: import("../../../lib/http/pagination/cursor-pagination").PaginationMeta;
    }>;
    findByBranch: (branchId: number, params?: PaginationParams, filters?: FilterParams[]) => Promise<{
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
    findById: (id: number) => Promise<import("../entity/product.entity").Product>;
    create: (restaurantId: number, role: SystemRole, userId: number, data: CreateProductDTO) => Promise<import("../entity/product.entity").Product>;
    update: (productId: number, data: UpdateProductDTO, role: SystemRole, userId: number, branchId?: number) => Promise<{
        result: {
            updatedProduct: import("../entity/product.entity").Product;
            category: import("../entity/product-category.entity").ProductCategory | undefined;
            branchDetails: import("../entity/product-branch-details.entity").ProductBranchDetails | undefined;
        };
    }>;
    /**
     * Atomically decrements branch stock for each item. Locks the rows FOR UPDATE
     * and emits product.stock.changed per decrement so order-service invalidates
     * its cache.
     */
    reserveStock: (branchId: number, items: ReserveStockInput[]) => Promise<ReserveStockResult>;
    findByBranchAndIds: (branchId: number, productIds: number[]) => Promise<BranchProductRow[]>;
    undoReserveStock: (branchId: number, items: ReserveStockInput[]) => Promise<ReserveStockResult>;
}
