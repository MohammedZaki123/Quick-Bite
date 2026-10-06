import {UserService} from "../service/user.service";
import {authenticate} from "../../../lib/auth/guard";
import {NextFunction, Request, Response} from "express";
import {validateBody} from "../../../lib/validation/validate";
import {patchUserDto} from "../dto/user.dto";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess} from "../../../lib/http/response";

@injectable()
export class UserController {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {

    }

    getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
        //     stripe user info from cookie using authenticate middleware
        //     call userService.getUserInfo with user id from token
        //     return response with user info or catch business logic errors.ts
        try{
            const user = await this.userService.getUserInfo(req.user?.userId!);
            sendSuccess(res, {user});
        }catch(err){
            next(err);
        }
    }

    editUserInfo = async (req: Request, res: Response, next: NextFunction) => {
        try{
        //     validate input data using validateBody and patchUserDto
        //     stripe user info from cookie using authenticate middleware
        //     call userService.updateUserInfo with user id from token and validated data
        //     return response with updated user info or catch business logic errors.ts
            const validatedData = await validateBody(patchUserDto, req.body);
            const updatedUser = await this.userService.updateUserInfo(req.user?.userId!, validatedData);
            sendSuccess(res, {
                message: "Profile updated",
                user: updatedUser
            });
        }catch(err){
            next(err);
        }
    }

    getAgentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agentId = Number(req.params.id);
            const agent = await this.userService.getAgentById(agentId);
            sendSuccess(res, {agent});
        } catch (error) {
            next(error);
        }
    }
}


