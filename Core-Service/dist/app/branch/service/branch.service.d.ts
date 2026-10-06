import { AddBranchDTO, PatchBranchDTO, PatchBranchStatusDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { SystemRole } from "../../user/enums";
import { FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
import { BranchWithRestaurant } from "../types";
export declare class BranchService {
    getBranches: (restaurantID: number, params: PaginationParams, filters: FilterParams[]) => Promise<{
        data: Partial<Branch>[];
        meta: import("../../../lib/http/pagination/cursor-pagination").PaginationMeta;
    }>;
    createBranch: (restaurantID: number, userId: number, role: SystemRole, data: AddBranchDTO) => Promise<Branch>;
    editBranch: (branchId: number, userId: number, role: SystemRole, data: PatchBranchDTO) => Promise<Branch>;
    editBranchStatus: (branchId: number, role: SystemRole, data: PatchBranchStatusDTO) => Promise<Branch>;
    findNearBy: (lat: number, lng: number) => Promise<{
        id: any;
        restaurantId: any;
        addressText: any;
        label: any;
        lat: any;
        lng: any;
        isActive: any;
        acceptOrders: any;
        currency: any;
        deliveryRadius: any;
        restaurantName: any;
        logoUrl: any;
    }[]>;
    private filterBranches;
    findByIdWithRestaurant: (branchId: number) => Promise<BranchWithRestaurant | null>;
    findByIdsWithRestaurant: (branchIds: number[]) => Promise<BranchWithRestaurant[]>;
}
