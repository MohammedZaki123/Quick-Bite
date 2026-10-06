import {RestaurantMember} from "../entity/restaurant-member.entity";
import {Knex} from "knex";
import {db} from "../../../lib/knex/knex";
import {MemberStatus} from "../enums";
import {deleteMemberBranchesByMemberId} from "./member-branch.repo";
import {PaginationParams, applyCursorPagination, FilterParams, applyFilters} from "../../../lib/http/pagination/cursor-pagination";

function toEntity(data: any) {
    return new RestaurantMember({
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



export async function createRestaurantMember(restaurantMember: Partial<RestaurantMember>, conn: Knex = db) {
    const query = conn || db;
    const record = await query("restaurant_members").insert(
        {
            user_id: restaurantMember.userId,
            restaurant_id: restaurantMember.restaurantId,
            role_id: restaurantMember.roleId,
            status: restaurantMember.status,
            created_at: restaurantMember.createdAt,
            updated_at: restaurantMember.updatedAt
        }
    ).returning(RESTAURANT_MEMBER_COLUMNS);

    return toEntity(record[0]);
}

export async function activateMemberByUserId(userId: number, conn: Knex = db) {
    const query = conn || db;
    await query("restaurant_members").where('user_id', userId).update(
        {
            status: MemberStatus.ACTIVE,
            updated_at: new Date()
        }
    ).returning(RESTAURANT_MEMBER_COLUMNS);
}

export async function findMemberWithRoleUserId(userId: number) {
//     Select rm.id, rm.restaurant_id , r.name from RestaurantMembers rm
//     join Roles on rm.roles = r.id
//     where rm.user_id = userId and rm.status = ACTIVE;
    const row = await db("restaurant_members as rm").select(
        "rm.id" ,
        "rm.restaurant_id",
        "r.name as roleName"
    ).join("roles as r","rm.role_id","r.id")
        .where("rm.user_id", userId)
        .andWhere("rm.status",MemberStatus.ACTIVE).first();

    return {
        id: row.id,
        restaurantId: row.restaurant_id,
        roleName: row.roleName,
    };
}

export async function findMembersByRestaurantId(restaurantId: number, params?: PaginationParams, filters?: FilterParams[]){
    let query = db("restaurant_members as m")
        .join("users as u", "m.user_id", "u.id")
        .join("roles as r", "m.role_id", "r.id")
        .select(
            "m.id",
            "m.user_id",
            "u.email",
            "u.name",
            "u.phone",
            "r.name as roleName",
            "r.display_name",
            "m.status",
        )
        .where("m.restaurant_id", restaurantId);

    if(filters) {
        query = applyFilters(query, filters);
    }

    if(params) {
        query = applyCursorPagination(query, params);
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

export async function findMemberWithRoleMemberId(memberId: number) {
//     POSTGRES RAW
//     SELECT rm.*, r.role
// FROM restaurant_members rm
// JOIN roles r ON rm.role_id = r.id
// WHERE rm.id = memberId;

        const row = await db("restaurant_members as rm")
            .select( "rm.id as id",
                "rm.user_id as user_id",
                "rm.restaurant_id as restaurant_id",
                "rm.role_id as role_id",
                "rm.status as status",
                "rm.created_at as created_at",
                "rm.updated_at as updated_at",
                "r.name as roleName"
            )
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
        }
}

export async function updateMember(memberId: number, data: Partial<RestaurantMember>) {
    const updatedData: any = {
        updated_at: new Date(),
    }
    if(data.roleId !== undefined) updatedData.role_id = data.roleId;
    if(data.status !== undefined) updatedData.status = data.status;
    const  record = await db("restaurant_members").where('id', memberId).update(
        updatedData
    ).returning(RESTAURANT_MEMBER_COLUMNS);

    return toEntity(record[0]);
}

export async function deleteMember(memberId: number, trx?: Knex.Transaction) {
    const query = trx || db;
    await query("restaurant_members").where('id', memberId).delete();
}

