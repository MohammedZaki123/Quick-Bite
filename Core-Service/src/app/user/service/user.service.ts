import {createUser, findUserExistsByEmailOrPhone, getUserById, updateUser} from "../repository/user.repo";
import {UserNotFoundError} from "../errors";
import {patchUserDto} from "../dto/user.dto";
import {injectable} from "tsyringe";
import {SystemRole} from "../enums";
import {hashPassword} from "../../auth/utils";
import {Knex} from "knex";

export interface CreateUserData {
    email: string,
    phone: string,
    name: string,
    password: string
    role: SystemRole,
}

@injectable()
export class UserService {
    create = async (data: CreateUserData, trx?: Knex | Knex.Transaction) => {
        const exists = await findUserExistsByEmailOrPhone(data.email,data.phone);
        if(exists){
            throw UserNotFoundError;
        }
        let hashedPassword;
        if(data.role !== SystemRole.RESTAURANT_USER){
            hashedPassword = await hashPassword(data.password);
        }
        const now = new Date();
        return await createUser({
            email: data.email,
            phone: data.phone,
            name: data.name,
            passwordHash: hashedPassword || data.password,
            systemRole: data.role,
            createdAt: now,
            updatedAt: now,
        }, trx);

    }
    getUserInfo = async (userId: number) => {
        const user = await getUserById(userId);
        if(!user){
            throw UserNotFoundError;
        }

        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            systemRole: user.systemRole,
        }
    }
    updateUserInfo = async (userId: number, data: patchUserDto) => {
    //    user id surely exists because it is extracted from token stored in cookie after login
    //     call findUserById to check if user is soft deleted or not
        const u = await getUserById(userId);
        if (!u) {
            throw UserNotFoundError;
        }
        const user = await updateUser(userId, data);

        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            systemRole: user.systemRole,
        }
    }

    // deleteUser = async (userId: number, trx?: Knex.Transaction) => {
    //     await deleteUser(userId, trx);
    // }

    getAgentById = async (id: number) => {
        const user = await getUserById(id);
        if (!user) throw UserNotFoundError;
        if (user.systemRole !== SystemRole.DELIVERY_AGENT) {
            // Use UserNotFoundError to avoid enumeration of other user types.
            throw UserNotFoundError;
        }
        return {id: user.id, name: user.name, phone: user.phone};
    }
}

