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
exports.AuthService = void 0;
const user_repo_1 = require("../../user/repository/user.repo");
const password_reset_repo_1 = require("../repository/password-reset.repo");
const error_1 = require("../error");
const utils_1 = require("../utils");
const enums_1 = require("../../user/enums");
const restaurant_service_1 = require("../../restaurant/service/restaurant.service");
const errors_1 = require("../../../lib/auth/errors");
const knex_1 = require("../../../lib/knex/knex");
const restaurant_member_repo_1 = require("../../rbac/repository/restaurant-member.repo");
const member_branch_repo_1 = require("../../rbac/repository/member-branch.repo");
const user_service_1 = require("../../user/service/user.service");
const member_service_1 = require("../../rbac/service/member.service");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const password_reset_1 = require("../templates/password-reset");
const errors_2 = require("../../user/errors");
let AuthService = class AuthService {
    restaurantService;
    userService;
    memberService;
    emailService;
    constructor(restaurantService, userService, memberService, emailService) {
        this.restaurantService = restaurantService;
        this.userService = userService;
        this.memberService = memberService;
        this.emailService = emailService;
    }
    register = async (data) => {
        //     0. if role is system admin throw error
        if (data.role === enums_1.SystemRole.SYSTEM_ADMIN) {
            throw error_1.CannotSignupAsSystemAdmin;
        }
        //     1. check if user exists by email
        //     2. if exists throw error
        if (await (0, user_repo_1.findUserExistsByEmailOrPhone)(data.email, data.phone)) {
            throw error_1.UserAlreadyExistsError;
        }
        //     3. hash password
        const trx = await knex_1.db.transaction();
        let user;
        let restaurant;
        let restaurantMemberInfo;
        const userData = {
            email: data.email,
            phone: data.phone,
            name: data.name,
            password: data.password,
            role: data.role,
        };
        try {
            user = await this.userService.create(userData, trx);
            // TODO: check if user role is restaurant member in order to create Restaurant and add it to Restaurants table
            if (user.systemRole == enums_1.SystemRole.RESTAURANT_USER) {
                if (data.restaurant == undefined) {
                    throw errors_1.RestaurantDataRequiredError;
                }
                restaurant = await this.restaurantService.createRestaurant(user.id, data.restaurant, trx);
                const member = await this.memberService.createOwner(restaurant.id, user.id, trx);
                restaurantMemberInfo = {
                    restaurantId: member.restaurantId,
                    restaurantRole: 'owner',
                    branchIds: [],
                };
            }
            await trx.commit();
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        };
        //     5. create refresh token and access token
        const accessToken = (0, utils_1.createAccessToken)(payload);
        const refreshToken = (0, utils_1.createRefreshToken)(payload);
        //     6. return user and refresh token and access token
        return {
            message: "successfully registered user",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            },
            restaurant
        };
    };
    login = async (data) => {
        //     Use getUserByEmail to find user by email
        const user = await (0, user_repo_1.getUserByEmail)(data.email);
        //     if user not found throw error "Invalid email or password"
        if (!user) {
            throw error_1.InvalidEmailOrPasswordError;
        }
        //     compare input password with stored password hash
        const areEqual = await (0, utils_1.comparePassword)(data.password, user.passwordHash);
        //     if password does not match throw error "Invalid email or password"
        if (!areEqual) {
            throw error_1.InvalidEmailOrPasswordError;
        }
        // TODO: Restaurant Member User Section
        //  set restaurantMemberInfo object to null at the start
        //  check if user role is Restaurant User
        //   if yes call getRestaurantMemberInfo of restaurant member repo layer using userId
        //   add returned memberId and roleName to resInfo object initialized before
        //   call getBranchesUsingMemberId of member branch repo layer using member_id from last call
        //   add returned branched Ids to resInfo object initialized before
        let restaurantMemberInfo = null;
        if (user.systemRole === enums_1.SystemRole.RESTAURANT_USER) {
            const memberInfo = await (0, restaurant_member_repo_1.findMemberWithRoleUserId)(user.id);
            const branchIds = await (0, member_branch_repo_1.findBranchIdsByMemberId)(memberInfo.id);
            restaurantMemberInfo = {
                restaurantId: memberInfo.restaurantId,
                restaurantRole: memberInfo.roleName,
                branchIds
            };
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        };
        //     create access token and refresh token
        const accessToken = (0, utils_1.createAccessToken)(payload);
        const refreshToken = (0, utils_1.createRefreshToken)(payload);
        //     return user and tokens
        return {
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            }
        };
    };
    forgetPassword = async (data) => {
        // 1. check if user exists by email
        // 2. if not exists throw an error
        // 3. generate a 6 digit OTP
        // 4. hash the OTP
        // 5. Create password reset request and added to the database with expiry time and id
        // from output of user table
        // 6. Send OTP to user email
        const user = await (0, user_repo_1.getUserByEmail)(data.email);
        if (!user) {
            throw errors_2.UserNotFoundError;
        }
        const otp = (0, utils_1.generateOTP)();
        const hashedOTP = (0, utils_1.hashOTP)(otp);
        await (0, password_reset_repo_1.createPasswordResetRequest)({
            userId: user.id,
            otpHash: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 15 minutes
            createdAt: new Date(),
        });
        const email = (0, password_reset_1.passwordResetEmail)(otp);
        await this.emailService.send(data.email, email.subject, email.html);
    };
    resetPassword = async (data) => {
        // 0. Get user record using email from input
        // 1. get latest password reset request for user email
        // 2. if no request found or request is expired throw an error
        // 3. compare input OTP with stored OTP hash
        // 4. if OTP does not match throw an error
        // 5. hash new password
        // 6. update user password with new hash
        // 7. mark the password reset request as consumed
        const user = await (0, user_repo_1.getUserByEmail)(data.email);
        if (!user) {
            return;
        }
        const latestResetRequest = await (0, password_reset_repo_1.getLatestPasswordResetRequestById)(user.id);
        if (!latestResetRequest || latestResetRequest.is_expired()) {
            throw error_1.resetPasswordFailedError;
        }
        const isOTPValid = (0, utils_1.compareOTP)(data.otp, latestResetRequest.otpHash);
        if (!isOTPValid) {
            throw error_1.resetPasswordFailedError;
        }
        const hashedPassword = await (0, utils_1.hashPassword)(data.newPassword);
        await (0, user_repo_1.updateUserPassword)(user.id, hashedPassword);
        await (0, password_reset_repo_1.consumePasswordResetRequest)(latestResetRequest.id);
        return user;
    };
    refreshToken = async (refreshToken) => {
        //         verify input refresh token if its expired or invalid throw error
        // if valid create new access token and return
        // const payload: JwtPayload = verifyRefreshToken(data.refreshToken);
        // if (!payload) {
        //     throw invalidTokenError;
        // }
        //
        //
        // const newAccessToken = createAccessToken(payload);
        //
        // return {
        //     newAccessToken,
        // }
        if (!refreshToken) {
            throw error_1.invalidTokenError;
        }
        const payload = (0, utils_1.verifyRefreshToken)(refreshToken);
        let resMemberInfo = {};
        if (payload.role === enums_1.SystemRole.RESTAURANT_USER) {
            resMemberInfo.restaurantId = payload.restaurantId;
            resMemberInfo.restaurantRole = payload.restaurantRole;
            resMemberInfo.branchIds = payload.branchIds;
        }
        const accessToken = (0, utils_1.createAccessToken)({ userId: payload.userId, role: payload.role, email: payload.email, ...resMemberInfo });
        return { accessToken };
    };
    acceptInvite = async (data) => {
        // reuse resetPassword function
        // updated Restaurant Member status
        const user = await this.resetPassword(data);
        await (0, restaurant_member_repo_1.activateMemberByUserId)(user.id);
    };
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.RestaurantService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserService)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.MemberService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.EmailProvider)),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService,
        user_service_1.UserService,
        member_service_1.MemberService, Object])
], AuthService);
