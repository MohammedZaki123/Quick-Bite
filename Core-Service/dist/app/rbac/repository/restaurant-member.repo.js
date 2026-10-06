"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestaurantMember = createRestaurantMember;
exports.activateMemberByUserId = activateMemberByUserId;
exports.findMemberWithRoleUserId = findMemberWithRoleUserId;
exports.findMembersByRestaurantId = findMembersByRestaurantId;
exports.findMemberWithRoleMemberId = findMemberWithRoleMemberId;
exports.updateMember = updateMember;
exports.deleteMember = deleteMember;
const restaurant_member_entity_1 = require("../entity/restaurant-member.entity");
const knex_1 = require("../../../lib/knex/knex");
const enums_1 = require("../enums");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
function toEntity(data) {
    return new restaurant_member_entity_1.RestaurantMember({
        id: data.id,
        userId: data.user_id,
        restaurantId: data.restaurant_id,
        roleId: data.role_id,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    });
}
const RESTAURANT_MEMBER_COLUMNS = ["id", "user_id", "restaurant_id", "role_id", "status", "created_at", "updated_at"];
async function createRestaurantMember(restaurantMember, conn = knex_1.db) {
    const query = conn || knex_1.db;
    const record = await query("restaurant_members").insert({
        user_id: restaurantMember.userId,
        restaurant_id: restaurantMember.restaurantId,
        role_id: restaurantMember.roleId,
        status: restaurantMember.status,
        created_at: restaurantMember.createdAt,
        updated_at: restaurantMember.updatedAt
    }).returning(RESTAURANT_MEMBER_COLUMNS);
    return toEntity(record[0]);
}
async function activateMemberByUserId(userId, conn = knex_1.db) {
    const query = conn || knex_1.db;
    await query("restaurant_members").where('user_id', userId).update({
        status: enums_1.MemberStatus.ACTIVE,
        updated_at: new Date()
    }).returning(RESTAURANT_MEMBER_COLUMNS);
}
async function findMemberWithRoleUserId(userId) {
    //     Select rm.id, rm.restaurant_id , r.name from RestaurantMembers rm
    //     join Roles on rm.roles = r.id
    //     where rm.user_id = userId and rm.status = ACTIVE;
    const row = await (0, knex_1.db)("restaurant_members as rm").select("rm.id", "rm.restaurant_id", "r.name as roleName").join("roles as r", "rm.role_id", "r.id")
        .where("rm.user_id", userId)
        .andWhere("rm.status", enums_1.MemberStatus.ACTIVE).first();
    return {
        id: row.id,
        restaurantId: row.restaurant_id,
        roleName: row.roleName,
    };
}
async function findMembersByRestaurantId(restaurantId, params, filters) {
    let query = (0, knex_1.db)("restaurant_members as m")
        .join("users as u", "m.user_id", "u.id")
        .join("roles as r", "m.role_id", "r.id")
        .select("m.id", "m.user_id", "u.email", "u.name", "u.phone", "r.name as roleName", "r.display_name", "m.status")
        .where("m.restaurant_id", restaurantId);
    if (filters) {
        query = (0, cursor_pagination_1.applyFilters)(query, filters);
    }
    if (params) {
        query = (0, cursor_pagination_1.applyCursorPagination)(query, params);
    }
    const rows = await query;
    return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        role: row.roleName,
        roleDisplayName: row.display_name,
        status: row.status,
        createdAt: row.created_at
    }));
}
async function findMemberWithRoleMemberId(memberId) {
    //     POSTGRES RAW
    //     SELECT rm.*, r.role
    // FROM restaurant_members rm
    // JOIN roles r ON rm.role_id = r.id
    // WHERE rm.id = memberId;
    const row = await (0, knex_1.db)("restaurant_members as rm")
        .select("rm.id as id", "rm.user_id as user_id", "rm.restaurant_id as restaurant_id", "rm.role_id as role_id", "rm.status as status", "rm.created_at as created_at", "rm.updated_at as updated_at", "r.name as roleName")
        .join("roles as r", "rm.role_id", "r.id")
        .where("rm.id", memberId)
        .first();
    if (!row) {
        return null;
    }
    return {
        member: toEntity({
            id: row.id,
            user_id: row.user_id,
            restaurant_id: row.restaurant_id,
            role_id: row.role_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at
        }),
        roleName: row.roleName
    };
}
async function updateMember(memberId, data) {
    const updatedData = {
        updated_at: new Date(),
    };
    if (data.roleId !== undefined)
        updatedData.role_id = data.roleId;
    if (data.status !== undefined)
        updatedData.status = data.status;
    const record = await (0, knex_1.db)("restaurant_members").where('id', memberId).update(updatedData).returning(RESTAURANT_MEMBER_COLUMNS);
    return toEntity(record[0]);
}
async function deleteMember(memberId, trx) {
    const query = trx || knex_1.db;
    await query("restaurant_members").where('id', memberId).delete();
}
