import { MemberService } from "../service/member.service";
import { NextFunction, Request, Response } from "express";
export declare class MemberController {
    private readonly memberService;
    constructor(memberService: MemberService);
    createMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMember: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMemberBranches: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRolePermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPermissionsByRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
