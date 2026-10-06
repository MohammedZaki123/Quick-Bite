"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMemberBranches = setMemberBranches;
exports.findBranchIdsByMemberId = findBranchIdsByMemberId;
exports.deleteMemberBranchesByMemberId = deleteMemberBranchesByMemberId;
exports.countBranchesByIdsAndRestaurant = countBranchesByIdsAndRestaurant;
const member_branch_entity_1 = require("../entity/member-branch.entity");
const knex_1 = require("../../../lib/knex/knex");
function toEntity(row) {
    return new member_branch_entity_1.MemberBranch({
        memberId: row.member_id,
        branchId: row.branch_id,
        createdAt: row.created_at,
    });
}
async function setMemberBranches(memberBranches, trx) {
    const query = trx || knex_1.db;
    //     clear old branches of member
    await query("member_branches").where('member_id', memberBranches[0].memberId).delete();
    //     insert new branches for member
    if (memberBranches.length > 0) {
        await query("member_branches").insert(memberBranches.map(row => ({
            member_id: row.memberId,
            branch_id: row.branchId,
            created_at: row.createdAt
        })));
    }
}
async function findBranchIdsByMemberId(memberId) {
    const rows = await (0, knex_1.db)("member_branches").select("branch_id").where('member_id', memberId);
    // return rows?.map(row => row.branch_id); // [{branch_id:2}, {branch_id:3}] -> [2,3]// [{branch_id:2}, {branch_id:3}] -> [2,3]
    const memberBranches = rows.map(toEntity);
    return memberBranches.map(row => row.branchId);
}
async function deleteMemberBranchesByMemberId(memberId, trx) {
    const query = trx || knex_1.db;
    await query("member_branches").where('member_id', memberId).delete();
}
async function countBranchesByIdsAndRestaurant(branchIds, restaurantId) {
    const record = await (0, knex_1.db)("restaurant_branches").count("* as count")
        .whereIn('id', branchIds).andWhere('restaurant_id', restaurantId).first();
    return record?.count || 0;
}
