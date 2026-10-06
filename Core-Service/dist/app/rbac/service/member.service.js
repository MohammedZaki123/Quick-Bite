"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
const errors_1 = require("../errors");
const restaurant_repo_1 = require("../../restaurant/repository/restaurant.repo");
const errors_2 = require("../../restaurant/errors");
const user_repo_1 = require("../../user/repository/user.repo");
const error_1 = require("../../auth/error");
const knex_1 = require("../../../lib/knex/knex");
const enums_1 = require("../../user/enums");
const restaurant_member_repo_1 = require("../repository/restaurant-member.repo");
const enums_2 = require("../enums");
const member_branch_repo_1 = require("../repository/member-branch.repo");
const member_branch_entity_1 = require("../entity/member-branch.entity");
const utils_1 = require("../../auth/utils");
const password_reset_repo_1 = require("../../auth/repository/password-reset.repo");
const time_1 = require("../../../pkg/utils/time");
const role_repo_1 = require("../repository/role.repo");
const errors_3 = require("../../../lib/auth/errors");
const permission_repo_1 = require("../repository/permission.repo");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const user_service_1 = require("../../user/service/user.service");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
let MemberService = class MemberService {
    userService;
    emailService;
    constructor(userService, emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }
    createMember = async (restaurantId, data) => {
        //     TODO: Business logic
        //      check if data.role is not owner because there is another way to register owner
        //      check if restaurant Id exist in the first place
        //      call repository layer of role to check that role with this name exist
        //      check if a user with this email exist in the system
        //       if exist call EmailAlreadyExist error
        //       Form a DB transaction
        //      create a one try/catch block for all DB call operations
        //       if not create, call createUser function of auth repository layer
        //       call createRestaurantMember function of member repository layer (Do not forget to set status to inactive) using user_id created in createUser function
        //       iterate over all branchIds to Create a member branch objects and store them in memberBranches array
        //       call setMemberBranches function of member-branch repository layer using returned member object member_id attribute
        //       generate Random OTP
        //       create PasswordReset object using required attributes
        //       send an invitation message to member using the input email
        //      roll back the transaction if any call produced an error
        if (data.role == "owner") {
            throw errors_1.CannotCreateOwnerUserError;
        }
        if (!await (0, restaurant_repo_1.findRestaurantById)(restaurantId)) {
            throw errors_2.RestaurantDoesNotExist;
        }
        const roleId = await (0, role_repo_1.findRoleByName)(data.role);
        if (!roleId) {
            throw errors_1.RoleNotFoundError;
        }
        if (await (0, user_repo_1.findUserExistsByEmailOrPhone)(data.email, data.phone)) {
            throw error_1.UserAlreadyExistsError;
        }
        // TODO: check that those input branches belong to that restaurant
        let branchesExist = false;
        if (data.branchIds) {
            branchesExist = true;
            await this.validateBranchOwnership(data.branchIds, restaurantId);
        }
        const trx = await knex_1.db.transaction();
        const now = new Date();
        try {
            const user = await this.userService.create({
                email: data.email,
                phone: data.phone,
                name: data.name,
                password: '',
                role: enums_1.SystemRole.RESTAURANT_USER,
            }, trx);
            const member = await (0, restaurant_member_repo_1.createRestaurantMember)({
                userId: user.id,
                restaurantId,
                roleId: roleId,
                status: enums_2.MemberStatus.INACTIVE,
                createdAt: now,
                updatedAt: now
            }, trx);
            if (branchesExist) {
                const memberBranches = data.branchIds.map(branchId => new member_branch_entity_1.MemberBranch({
                    memberId: member.id,
                    branchId,
                    createdAt: now
                }));
                await (0, member_branch_repo_1.setMemberBranches)(memberBranches, trx);
            }
            const otp = (0, utils_1.generateOTP)();
            console.log(otp);
            const hashedOtp = (0, utils_1.hashOTP)(otp);
            await (0, password_reset_repo_1.createPasswordResetRequest)({
                userId: user.id,
                otpHash: hashedOtp,
                expiresAt: new Date(Date.now() + (0, time_1.toMs)(1, 'h')),
                createdAt: now,
                consumedAt: null
            }, trx);
            // const invitationEmail = memberInvitationEmail(otp, data.role);
            // await this.emailService.send(data.email,invitationEmail.subject,invitationEmail.subject);
            console.log(`Mocked Otp ${otp}`);
            await trx.commit();
            return {
                "message": "Member invited successfully",
                member: {
                    id: member.id,
                    userId: user.id,
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    role: data.role,
                    status: enums_2.MemberStatus.INACTIVE,
                    branchIds: data.branchIds,
                }
            };
        }
        catch (err) {
            trx.rollback();
            throw err;
        }
    };
    createOwner = async (restaurantId, userId, trx) => {
        const roleId = await (0, role_repo_1.findRoleByName)('owner');
        const now = new Date();
        const member = await (0, restaurant_member_repo_1.createRestaurantMember)({
            userId: userId,
            restaurantId: restaurantId,
            roleId,
            status: enums_2.MemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now
        }, trx);
        return member;
    };
    listMembers = async (restaurantId, params, filters) => {
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(restaurantId);
        if (!restaurant) {
            throw errors_2.RestaurantDoesNotExist;
        }
        const members = await (0, restaurant_member_repo_1.findMembersByRestaurantId)(restaurantId);
        if (params) {
            return (0, cursor_pagination_1.buildPaginationResult)(members, params.limit, params.sortBy);
        }
        return { data: members, meta: { nextCursor: null, hasMore: false, count: members.length } };
    };
    updateMember = async (restaurantId, memberId, data) => {
        const memberWithRole = await (0, restaurant_member_repo_1.findMemberWithRoleMemberId)(memberId);
        if (!memberWithRole) {
            throw errors_1.MemberNotFoundError;
        }
        if (restaurantId !== Number(memberWithRole.member.restaurantId)) {
            throw errors_3.NotAuthorized;
        }
        const dataToUpdated = {
            status: data.status
        };
        if (data.role) {
            const roleId = await (0, role_repo_1.findRoleByName)(data.role);
            if (!roleId) {
                throw errors_1.RoleNotFoundError;
            }
            dataToUpdated.roleId = roleId;
        }
        return await (0, restaurant_member_repo_1.updateMember)(memberId, dataToUpdated);
    };
    deleteMember = async (restaurantId, memberId) => {
        const memberWithRole = await (0, restaurant_member_repo_1.findMemberWithRoleMemberId)(memberId);
        if (!memberWithRole) {
            throw errors_1.MemberNotFoundError;
        }
        if (restaurantId !== Number(memberWithRole.member.restaurantId)) {
            throw errors_3.NotAuthorized;
        }
        if (memberWithRole.roleName === 'owner') {
            throw errors_1.CannotDeleteOwnerError;
        }
        const trx = await knex_1.db.transaction();
        try {
            await (0, member_branch_repo_1.deleteMemberBranchesByMemberId)(memberId, trx);
            await (0, restaurant_member_repo_1.deleteMember)(memberId, trx);
            // await this.userService.deleteUser(memberWithRole.member.userId, trx)
            trx.commit();
        }
        catch (err) {
            trx.rollback();
            throw err;
        }
    };
    updateMemberBranches = async (restaurantId, memberId, data) => {
        const memberWithRole = await (0, restaurant_member_repo_1.findMemberWithRoleMemberId)(memberId);
        if (!memberWithRole) {
            throw errors_1.MemberNotFoundError;
        }
        if (restaurantId !== Number(memberWithRole.member.restaurantId)) {
            throw errors_3.NotAuthorized;
        }
        if (memberWithRole.roleName === 'owner') {
            throw errors_3.NotAuthorized;
        }
        await this.validateBranchOwnership(data.branchIds, restaurantId);
        const memberBranches = data.branchIds.map(branchId => new member_branch_entity_1.MemberBranch({
            memberId: memberId,
            branchId,
            createdAt: new Date()
        }));
        await (0, member_branch_repo_1.setMemberBranches)(memberBranches);
    };
    getRolePermissions = async (roleName) => {
        const permissions = await (0, permission_repo_1.getPermissionsByRoleName)(roleName);
        return {
            role: roleName,
            permissions
        };
    };
    validateBranchOwnership = async (branchIds, restaurantId) => {
        if (branchIds.length === 0) {
            return;
        }
        const count = await (0, member_branch_repo_1.countBranchesByIdsAndRestaurant)(branchIds, restaurantId);
        if (Number(count) !== branchIds.length) {
            throw errors_1.IncorrectBranches;
        }
    };
    async getPermissionsByRole(roleName) {
        const permissions = await (0, permission_repo_1.getPermissionsByRoleName)(roleName);
        return { role: roleName, permissions };
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.EmailProvider)),
    __metadata("design:paramtypes", [user_service_1.UserService, Object])
], MemberService);
