import {
    createUser,
    findUserExistsByEmailOrPhone,
    getUserByEmail,
    updateUserPassword
} from "../../user/repository/user.repo";
import {
    consumePasswordResetRequest,
    createPasswordResetRequest,
    getLatestPasswordResetRequestById
} from "../repository/password-reset.repo";
import {ForgetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto} from "../dto/auth.dto";
import {
    CannotSignupAsSystemAdmin,
    InvalidEmailOrPasswordError,
    invalidTokenError,
    resetPasswordFailedError,
    UserAlreadyExistsError
} from "../error";
import {
    compareOTP,
    comparePassword,
    createAccessToken,
    createRefreshToken,
    generateOTP,
    hashOTP,
    hashPassword,
    JwtPayload,
    verifyRefreshToken
} from "../utils";
import {SystemRole} from "../../user/enums";
import {RestaurantService} from "../../restaurant/service/restaurant.service";
import {RestaurantDataRequiredError} from "../../../lib/auth/errors";
import {db} from "../../../lib/knex/knex";
import {
    activateMemberByUserId,
    createRestaurantMember,
    findMemberWithRoleUserId,
} from "../../rbac/repository/restaurant-member.repo";
import {findBranchIdsByMemberId} from "../../rbac/repository/member-branch.repo";
import {MemberStatus} from "../../rbac/enums";
import {findRoleByName} from "../../rbac/repository/role.repo";
import {CreateUserData, UserService} from "../../user/service/user.service";
import {MemberService} from "../../rbac/service/member.service";
import {inject, injectable} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import type {IEmailProvider} from "../../../pkg/email/email.interface";
import {passwordResetEmail} from "../templates/password-reset";
import {UserNotFoundError} from "../../user/errors";

@injectable()
export class AuthService {
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService,
               @inject(TOKENS.UserService) private readonly userService: UserService,
              @inject(TOKENS.MemberService)  private readonly memberService: MemberService,
                @inject(TOKENS.EmailProvider) private readonly emailService:  IEmailProvider) {
    }

    register = async (data: RegisterDto) => {
        //     0. if role is system admin throw error
        if (data.role === SystemRole.SYSTEM_ADMIN) {
            throw CannotSignupAsSystemAdmin;
        }
        //     1. check if user exists by email
        //     2. if exists throw error
        if (await findUserExistsByEmailOrPhone(data.email, data.phone)) {
            throw UserAlreadyExistsError;
        }
        //     3. hash password
        const trx = await db.transaction();
        let user;
        let restaurant;
        let restaurantMemberInfo;
        const userData : CreateUserData = {
            email : data.email,
            phone: data.phone,
            name: data.name,
            password: data.password,
            role: data.role,
        }
        try {
            user = await this.userService.create(userData, trx);
            // TODO: check if user role is restaurant member in order to create Restaurant and add it to Restaurants table
            if (user.systemRole == SystemRole.RESTAURANT_USER) {
                if (data.restaurant == undefined) {
                    throw RestaurantDataRequiredError;
                }
                restaurant = await this.restaurantService.createRestaurant(user.id, data.restaurant, trx)
                const member = await this.memberService.createOwner(restaurant.id, user.id, trx);
                restaurantMemberInfo = {
                    restaurantId: member.restaurantId,
                    restaurantRole: 'owner',
                    branchIds: [],
                };
            }
            await trx.commit()
        } catch (err) {
            await trx.rollback()
            throw err;
        }

        const payload: JwtPayload = {
            userId: user!.id,
            email: user!.email,
            role: user!.systemRole,
            ...restaurantMemberInfo
        }
        //     5. create refresh token and access token
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);
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
        }
    }

    login = async (data: LoginDto) => {
        //     Use getUserByEmail to find user by email
        const user = await getUserByEmail(data.email);
        //     if user not found throw error "Invalid email or password"
        if (!user) {
            throw InvalidEmailOrPasswordError;
        }
        //     compare input password with stored password hash
        const areEqual = await comparePassword(data.password, user.passwordHash)
        //     if password does not match throw error "Invalid email or password"
        if (!areEqual) {
            throw InvalidEmailOrPasswordError;
        }
        // TODO: Restaurant Member User Section
        //  set restaurantMemberInfo object to null at the start
        //  check if user role is Restaurant User
        //   if yes call getRestaurantMemberInfo of restaurant member repo layer using userId
        //   add returned memberId and roleName to resInfo object initialized before
        //   call getBranchesUsingMemberId of member branch repo layer using member_id from last call
        //   add returned branched Ids to resInfo object initialized before

        let restaurantMemberInfo = null;
        if(user.systemRole === SystemRole.RESTAURANT_USER){
            const memberInfo = await findMemberWithRoleUserId(user.id);
            const branchIds = await findBranchIdsByMemberId(memberInfo.id);
            restaurantMemberInfo = {
                restaurantId: memberInfo.restaurantId,
                restaurantRole: memberInfo.roleName,
                branchIds
            };
        }

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        }
        //     create access token and refresh token
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);
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
        }
    }

    forgetPassword = async (data: ForgetPasswordDto) => {
        // 1. check if user exists by email
        // 2. if not exists throw an error
        // 3. generate a 6 digit OTP
        // 4. hash the OTP
        // 5. Create password reset request and added to the database with expiry time and id
        // from output of user table
        // 6. Send OTP to user email
        const user = await getUserByEmail(data.email);
        if (!user) {
            throw UserNotFoundError;
        }
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);
        await createPasswordResetRequest({
            userId: user.id,
            otpHash: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 15 minutes
            createdAt: new Date(),
        });
        const email = passwordResetEmail(otp);
        await this.emailService.send(data.email, email.subject, email.html);
    }

    resetPassword = async (data: ResetPasswordDto) => {
        // 0. Get user record using email from input
        // 1. get latest password reset request for user email
        // 2. if no request found or request is expired throw an error
        // 3. compare input OTP with stored OTP hash
        // 4. if OTP does not match throw an error
        // 5. hash new password
        // 6. update user password with new hash
        // 7. mark the password reset request as consumed

        const user = await getUserByEmail(data.email);
        if (!user) {
            return;
        }
        const latestResetRequest = await getLatestPasswordResetRequestById(user.id);
        if (!latestResetRequest || latestResetRequest.is_expired()) {
            throw resetPasswordFailedError;
        }
        const isOTPValid = compareOTP(data.otp, latestResetRequest.otpHash);
        if (!isOTPValid) {
            throw resetPasswordFailedError;
        }
        const hashedPassword = await hashPassword(data.newPassword);
        await updateUserPassword(user.id, hashedPassword);
        await consumePasswordResetRequest(latestResetRequest.id);

        return user;
    }

    refreshToken = async (refreshToken: string) => {
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
            throw invalidTokenError;
        }
        const payload = verifyRefreshToken(refreshToken);
        let resMemberInfo:any = {};
        if(payload.role === SystemRole.RESTAURANT_USER){
            resMemberInfo.restaurantId = payload.restaurantId;
            resMemberInfo.restaurantRole = payload.restaurantRole;
            resMemberInfo.branchIds = payload.branchIds;
        }
        const accessToken = createAccessToken({userId: payload.userId, role: payload.role, email: payload.email,...resMemberInfo});
        return {accessToken};
    }

    acceptInvite = async (data: ResetPasswordDto) => {
        // reuse resetPassword function
        // updated Restaurant Member status
        const user = await this.resetPassword(data);

        await activateMemberByUserId(user!.id);
     }
}



