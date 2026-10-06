import { RestaurantMember } from "../entity/restaurant-member.entity";
import { Knex } from "knex";
import { PaginationParams, FilterParams } from "../../../lib/http/pagination/cursor-pagination";
export declare function createRestaurantMember(restaurantMember: Partial<RestaurantMember>, conn?: Knex): Promise<RestaurantMember>;
export declare function activateMemberByUserId(userId: number, conn?: Knex): Promise<void>;
export declare function findMemberWithRoleUserId(userId: number): Promise<{
    id: any;
    restaurantId: any;
    roleName: any;
}>;
export declare function findMembersByRestaurantId(restaurantId: number, params?: PaginationParams, filters?: FilterParams[]): Promise<{
    id: any;
    userId: any;
    email: any;
    name: any;
    phone: any;
    role: any;
    roleDisplayName: any;
    status: any;
    createdAt: any;
}[]>;
export declare function findMemberWithRoleMemberId(memberId: number): Promise<{
    member: RestaurantMember;
    roleName: any;
} | null>;
export declare function updateMember(memberId: number, data: Partial<RestaurantMember>): Promise<RestaurantMember>;
export declare function deleteMember(memberId: number, trx?: Knex.Transaction): Promise<void>;
