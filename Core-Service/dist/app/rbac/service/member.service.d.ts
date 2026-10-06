import { CreateMemberDto, UpdateMemberBranchesDTO, UpdateMemberDTO } from "../dto/member.dto";
import { MemberStatus } from "../enums";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { Knex } from "knex";
import { UserService } from "../../user/service/user.service";
import type { IEmailProvider } from "../../../pkg/email/email.interface";
import { FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
export declare class MemberService {
    private readonly userService;
    private readonly emailService;
    constructor(userService: UserService, emailService: IEmailProvider);
    createMember: (restaurantId: number, data: CreateMemberDto) => Promise<{
        message: string;
        member: {
            id: number;
            userId: number;
            email: string;
            name: string;
            phone: string;
            role: string;
            status: MemberStatus;
            branchIds: number[] | undefined;
        };
    }>;
    createOwner: (restaurantId: number, userId: number, trx?: Knex.Transaction) => Promise<RestaurantMember>;
    listMembers: (restaurantId: number, params?: PaginationParams, filters?: FilterParams[]) => Promise<{
        data: {
            id: any;
            userId: any;
            email: any;
            name: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            status: any;
            createdAt: any;
        }[];
        meta: import("../../../lib/http/pagination/cursor-pagination").PaginationMeta;
    }>;
    updateMember: (restaurantId: number, memberId: number, data: UpdateMemberDTO) => Promise<RestaurantMember>;
    deleteMember: (restaurantId: number, memberId: number) => Promise<void>;
    updateMemberBranches: (restaurantId: number, memberId: number, data: UpdateMemberBranchesDTO) => Promise<void>;
    getRolePermissions: (roleName: string) => Promise<{
        role: string;
        permissions: string[];
    }>;
    validateBranchOwnership: (branchIds: number[], restaurantId: number) => Promise<void>;
    getPermissionsByRole(roleName: string): Promise<{
        role: string;
        permissions: string[];
    }>;
}
