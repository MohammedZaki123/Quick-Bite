import {MemberBranch} from "../entity/member-branch.entity";
import {Knex} from "knex";
import {db} from "../../../lib/knex/knex";

function toEntity(row: any){
    return new MemberBranch({
        memberId: row.member_id,
        branchId: row.branch_id,
        createdAt: row.created_at,
    });
}

export async function setMemberBranches(memberBranches: MemberBranch[], trx?: Knex.Transaction) {
    const query = trx || db
//     clear old branches of member
    await query("member_branches").where('member_id', memberBranches[0].memberId).delete();
//     insert new branches for member
    if (memberBranches.length > 0) {
        await query("member_branches").insert(memberBranches.map(row => ({
            member_id: row.memberId,
            branch_id: row.branchId,
            created_at: row.createdAt
        }))
        );
    }
}

export async function findBranchIdsByMemberId(memberId: number){
    const rows = await db("member_branches").select("branch_id").where('member_id', memberId);

    // return rows?.map(row => row.branch_id); // [{branch_id:2}, {branch_id:3}] -> [2,3]// [{branch_id:2}, {branch_id:3}] -> [2,3]

    const memberBranches = rows.map(toEntity)

    return  memberBranches.map(row => row.branchId)

    }

export async function deleteMemberBranchesByMemberId(memberId: number, trx?:Knex.Transaction){
    const query = trx || db;
    await query("member_branches").where('member_id', memberId).delete();
}

export async function countBranchesByIdsAndRestaurant(branchIds: number[], restaurantId: number) {
    const record = await db("restaurant_branches").count("* as count")
        .whereIn('id', branchIds).andWhere('restaurant_id', restaurantId).first();

    return record?.count || 0;
}
