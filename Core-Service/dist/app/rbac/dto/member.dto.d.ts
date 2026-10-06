import { MemberStatus } from "../enums";
export declare class CreateMemberDto {
    email: string;
    name: string;
    phone: string;
    role: string;
    branchIds?: number[];
}
export declare class UpdateMemberDTO {
    role?: string;
    status?: MemberStatus;
}
export declare class UpdateMemberBranchesDTO {
    branchIds: number[];
}
