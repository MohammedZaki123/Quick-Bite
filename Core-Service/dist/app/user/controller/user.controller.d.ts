import { UserService } from "../service/user.service";
import { NextFunction, Request, Response } from "express";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editUserInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
