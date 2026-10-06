import {MemberService} from "../service/member.service";
import {NextFunction, Request, Response} from "express";
import {validateBody} from "../../../lib/validation/validate";
import {CreateMemberDto, UpdateMemberDTO, UpdateMemberBranchesDTO} from "../dto/member.dto";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess, sendPaginated} from "../../../lib/http/response";
import {parseFilterQuery, parsePaginationQuery} from "../../../lib/http/pagination/parse-query";
import {PaginationParams} from "../../../lib/http/pagination/cursor-pagination";
import {RoleQueryRequiredError} from "../errors";

@injectable()
export class MemberController {
    constructor(@inject(TOKENS.MemberService) private readonly memberService: MemberService) {
    }

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        try{
        //     validate body of DTO
            const validatedData = await validateBody(CreateMemberDto,req.body);
            const result = await this.memberService.createMember(Number(req.params.restaurantId), validatedData);
            sendSuccess(res, result, 201);
        }catch(err){
            next(err);
        }
    }
    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const restaurantId = Number(req.params.restaurantId);
            // const params: PaginationParams = parsePaginationQuery(req.query, ['email','userId']);
            // const filters = parseFilterQuery(req.query, ['userId', 'email','status']);
            const result = await this.memberService.listMembers(restaurantId);
            sendPaginated(res, result.data, result.meta);
        }catch(err){
            next(err);
        }
    }

    updateMember = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const validatedData = await validateBody(UpdateMemberDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            const result = await this.memberService.updateMember(restaurantId, memberId, validatedData);
            sendSuccess(res, {message: "Member updated successfully", data: result});
        }catch(err){
            next(err);
        }
    }
    deleteMember = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            await this.memberService.deleteMember(restaurantId, memberId);
            sendSuccess(res, {message: "Member deleted successfully"});
        }catch(err){
            next(err);
        }
    }
    updateMemberBranches = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const validatedData = await validateBody(UpdateMemberBranchesDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            await this.memberService.updateMemberBranches(restaurantId, memberId, validatedData);
            sendSuccess(res, {message: "Member branches updated successfully"});
        }catch(err){
            next(err);
        }
    }
    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const roleName = String(req.params.role);
            const result = await this.memberService.getRolePermissions(roleName);
            sendSuccess(res, {data: result});
        }catch(err){
            next(err);
        }
    }

    getPermissionsByRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = String(req.query.role ?? "");
            if (!role) throw RoleQueryRequiredError;
            const result = await this.memberService.getPermissionsByRole(role);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}

