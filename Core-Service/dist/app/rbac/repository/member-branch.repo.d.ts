import { MemberBranch } from "../entity/member-branch.entity";
import { Knex } from "knex";
export declare function setMemberBranches(memberBranches: MemberBranch[], trx?: Knex.Transaction): Promise<void>;
export declare function findBranchIdsByMemberId(memberId: number): Promise<number[]>;
export declare function deleteMemberBranchesByMemberId(memberId: number, trx?: Knex.Transaction): Promise<void>;
export declare function countBranchesByIdsAndRestaurant(branchIds: number[], restaurantId: number): Promise<string | number>;
