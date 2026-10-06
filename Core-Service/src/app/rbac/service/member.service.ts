import {CreateMemberDto, UpdateMemberBranchesDTO, UpdateMemberDTO} from "../dto/member.dto";
import {
    CannotCreateOwnerUserError,
    CannotDeleteOwnerError, IncorrectBranches,
    MemberNotFoundError,
    RoleNotFoundError
} from "../errors";
import {findRestaurantById} from "../../restaurant/repository/restaurant.repo";
import {RestaurantDoesNotExist} from "../../restaurant/errors";
import {createUser, findUserExistsByEmailOrPhone} from "../../user/repository/user.repo";
import {UserAlreadyExistsError} from "../../auth/error";
import {db} from "../../../lib/knex/knex";
import {SystemRole} from "../../user/enums";
import {
    createRestaurantMember, deleteMember,
    findMembersByRestaurantId, findMemberWithRoleMemberId,
    findMemberWithRoleUserId, updateMember
} from "../repository/restaurant-member.repo";
import {MemberStatus} from "../enums";
import {
    countBranchesByIdsAndRestaurant,
    deleteMemberBranchesByMemberId,
    setMemberBranches
} from "../repository/member-branch.repo";
import {MemberBranch} from "../entity/member-branch.entity";
import {generateOTP, hashOTP} from "../../auth/utils";
import {createPasswordResetRequest} from "../../auth/repository/password-reset.repo";
import {toMs} from "../../../pkg/utils/time";
import {findRoleByName} from "../repository/role.repo";
import {NotAuthorized} from "../../../lib/auth/errors";
import {RestaurantMember} from "../entity/restaurant-member.entity";
import {getPermissionsByRoleName} from "../repository/permission.repo";
import {inject, injectable} from "tsyringe";
import { BranchAccessNotPermitted } from "../../branch/errors";
import {Knex} from "knex";
import {TOKENS} from "../../../lib/di/tokens";
import {UserService} from "../../user/service/user.service";
import type {IEmailProvider} from "../../../pkg/email/email.interface";
import {memberInvitationEmail} from "../templates/member-invitation";
import {buildPaginationResult, FilterParams, PaginationParams} from "../../../lib/http/pagination/cursor-pagination";


@injectable()
export class MemberService {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService,
                @inject(TOKENS.EmailProvider) private readonly  emailService: IEmailProvider){
    }
    createMember = async (restaurantId: number, data: CreateMemberDto) => {
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
        if(data.role == "owner"){
            throw CannotCreateOwnerUserError;
        }

        if(!await findRestaurantById(restaurantId)){
            throw RestaurantDoesNotExist;
        }
        const roleId = await findRoleByName(data.role);
        if(!roleId){
            throw RoleNotFoundError;
        }
        if(await findUserExistsByEmailOrPhone(data.email,data.phone)){
            throw UserAlreadyExistsError
        }
        // TODO: check that those input branches belong to that restaurant
        let branchesExist = false
        if(data.branchIds){
            branchesExist = true
           await this.validateBranchOwnership(data.branchIds,restaurantId);
        }

        const trx = await db.transaction();
        const now =  new Date();
        try{
            const user = await this.userService.create({
                email: data.email,
                phone: data.phone,
                name: data.name,
                password: '',
                role: SystemRole.RESTAURANT_USER,
            },trx);

            const member = await createRestaurantMember({
                userId: user.id,
                restaurantId,
                roleId: roleId,
                status: MemberStatus.INACTIVE,
                createdAt: now,
                updatedAt: now
            },trx);

            if(branchesExist) {
                const memberBranches = data.branchIds!.map(branchId => new MemberBranch({
                    memberId: member.id,
                    branchId,
                    createdAt: now
                    })
                )
                await setMemberBranches(memberBranches,trx);
            }
            const otp = generateOTP();
            console.log(otp);
            const hashedOtp = hashOTP(otp);
            await createPasswordResetRequest({
                userId: user.id,
                otpHash: hashedOtp,
                expiresAt: new Date(Date.now() +toMs(1,'h')),
                createdAt: now,
                consumedAt: null
            },trx)
            // const invitationEmail = memberInvitationEmail(otp, data.role);
            // await this.emailService.send(data.email,invitationEmail.subject,invitationEmail.subject);
            console.log(`Mocked Otp ${otp}`);
            await trx.commit()
            return {
                "message": "Member invited successfully",
                member: {
                    id: member.id,
                    userId: user.id,
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    role: data.role,
                    status: MemberStatus.INACTIVE,
                    branchIds: data.branchIds,
                }
            }

        }catch(err){
            trx.rollback()
            throw err;
        }
    }

    createOwner = async (restaurantId: number, userId: number,trx?: Knex.Transaction
    ) => {
        const roleId = await findRoleByName('owner');
        const now = new Date();
        const member = await createRestaurantMember({
            userId: userId,
            restaurantId: restaurantId,
            roleId,
            status: MemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now
        },trx);

        return member;
    }
    listMembers = async (restaurantId: number, params?: PaginationParams, filters?: FilterParams[]) => {
        const restaurant = await findRestaurantById(restaurantId);
        if(!restaurant){
            throw RestaurantDoesNotExist
        }
        const members = await findMembersByRestaurantId(restaurantId);

        if(params) {
            return buildPaginationResult(members, params.limit, params.sortBy);
        }

        return {data: members, meta: {nextCursor: null, hasMore: false, count: members.length}};
    }

    updateMember = async (restaurantId: number, memberId: number, data: UpdateMemberDTO) => {
        const memberWithRole = await findMemberWithRoleMemberId(memberId);

        if(!memberWithRole){
            throw MemberNotFoundError
        }
        if(restaurantId !== Number(memberWithRole.member.restaurantId)){
            throw NotAuthorized     
        }

        const dataToUpdated:Partial<RestaurantMember> = {
            status: data.status
        }
        if(data.role){
            const roleId = await findRoleByName(data.role);
            if(!roleId){
                throw RoleNotFoundError;
            }
            dataToUpdated.roleId = roleId
        }

        return await updateMember(memberId,dataToUpdated);
    }

    deleteMember = async (restaurantId: number, memberId: number) => {
        const memberWithRole = await findMemberWithRoleMemberId(memberId);
        if(!memberWithRole){
            throw MemberNotFoundError
        }
        if(restaurantId !== Number(memberWithRole.member.restaurantId)){
            throw NotAuthorized
        }

        if(memberWithRole.roleName === 'owner'){
            throw CannotDeleteOwnerError
        }
        const trx = await db.transaction();
        try{
            await deleteMemberBranchesByMemberId(memberId,trx);
            await deleteMember(memberId,trx);
            // await this.userService.deleteUser(memberWithRole.member.userId, trx)
            trx.commit();
        }catch(err){
            trx.rollback()
            throw err;
        }

    }

    updateMemberBranches = async (restaurantId: number, memberId: number, data: UpdateMemberBranchesDTO) => {
        const memberWithRole = await findMemberWithRoleMemberId(memberId);

        if(!memberWithRole){
            throw MemberNotFoundError
        }
        if(restaurantId !== Number(memberWithRole.member.restaurantId)){
            throw NotAuthorized
        }
        if(memberWithRole.roleName === 'owner'){
            throw NotAuthorized
        }
       await this.validateBranchOwnership(data.branchIds, restaurantId);
        const memberBranches = data.branchIds.map(branchId => new MemberBranch({
                memberId: memberId,
                branchId,
                createdAt: new Date()
            })
        )
       await setMemberBranches(memberBranches);
    }

    getRolePermissions = async (roleName: string) => {
        const permissions = await getPermissionsByRoleName(roleName);
        return {
            role: roleName,
            permissions
        }
    }

    validateBranchOwnership = async(branchIds: number[], restaurantId: number) => {
        if(branchIds.length === 0){
            return;
        }
        const count = await countBranchesByIdsAndRestaurant(branchIds,restaurantId);
        if(Number(count) !== branchIds.length){
            throw IncorrectBranches
        }
    }
    async getPermissionsByRole(roleName: string) {
        const permissions = await getPermissionsByRoleName(roleName);
        return {role: roleName, permissions};
    }

}

