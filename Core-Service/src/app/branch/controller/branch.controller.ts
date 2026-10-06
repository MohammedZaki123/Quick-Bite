import {BranchService} from "../service/branch.service";
import {NextFunction, Request, Response} from "express";
import {validateBody, validatePathParameter} from "../../../lib/validation/validate";
import {AddBranchDTO, PatchBranchDTO, PatchBranchStatusDTO} from "../dto/branch.dto";
import {SystemRole} from "../../user/enums";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess, sendPaginated} from "../../../lib/http/response";
import {parseFilterQuery, parsePaginationQuery} from "../../../lib/http/pagination/parse-query";
import {PaginationParams} from "../../../lib/http/pagination/cursor-pagination";
import {BranchNotFound} from "../errors";

@injectable()
export class BranchController {
    constructor(@inject(TOKENS.BranchService) private readonly branchService: BranchService) {
    }

    addBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = validatePathParameter(req.params.restaurantId, "Restaurant ID");
            const validatedData = await validateBody(AddBranchDTO, req.body);
            const userId = req.user?.userId!;
            const role = req.user?.role! as SystemRole;
            const branch = await this.branchService.createBranch(restaurantId, userId, role, validatedData);
            sendSuccess(res, branch, 201);
        } catch (err) {
            next(err);
        }
    }

    getNearbyBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lat = Number(req.query.lat);
            const lng = Number(req.query.lng);
            // const params: PaginationParams = parsePaginationQuery(req.query, ['restaurantId','commission']);
            // const filters = parseFilterQuery(req.query, ['commission', 'restaurantId', 'currency']);
            // const result = await this.branchService.findNearBy(lat, lng, params, filters);
            const result = await this.branchService.findNearBy(lat, lng);
            // sendPaginated(res, result.data, result.meta);
            sendSuccess(res, result, 200);
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = validatePathParameter(req.params.restaurantId, "Restaurant ID");
            // const params: PaginationParams = parsePaginationQuery(req.query);
            // const filters = parseFilterQuery(req.query, ['id', 'label', 'currency', 'is_active']);
            const result = await this.branchService.getBranches(restaurantId);
            // sendPaginated(res, result.data, result.meta);
            sendSuccess(res, result, 200);
        } catch (err) {
            next(err)
        }
    }

    patchBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = validatePathParameter(req.params.id, "Branch ID");
            const validatedData = await validateBody(PatchBranchDTO, req.body);
            const branch = await this.branchService.editBranch(branchId, req.user?.userId!, req.user?.role! as SystemRole, validatedData);
            sendSuccess(res, {
                branch
            });
        } catch (err) {
            next(err);
        }
    }

    patchBranchStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = validatePathParameter(req.params.id, "Branch ID");
            const validatedData = await validateBody(PatchBranchStatusDTO, req.body);
            const branch = await this.branchService.editBranchStatus(branchId, req.user?.role! as SystemRole, validatedData);
            sendSuccess(res, {
                branch: {
                    id: branch.id,
                    isActive: branch.isActive,
                    acceptOrders: branch.acceptOrders,
                    commission: branch.commission
                }
            });
        } catch (err) {
            next(err);
        }
    }

    // putBranch = async  (req: Request , res: Response, next: NextFunction) => {
    //     try{
    //         const branchId = validatePathParameter(req.params.id, "Branch ID");
    //         const validatedData = await validateBody(PutBranchDTO, req.body);
    //         const branch = this.branchService.editBranchRadius(branchId, validatedData);
    //         res.status(200).json({
    //             branch
    //         })
    //     }catch(err){
    //         next(err);
    //     }
    // }

    findByIdWithRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.branchService.findByIdWithRestaurant(id);
            if (!result) throw BranchNotFound;
            sendSuccess(res, toInternalBranchDTO(result));
        } catch (err) {
            next(err);
        }
    }

    findByIdsWithRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const raw = String(req.query.ids ?? "").trim();
            if (!raw) return sendSuccess(res, []);
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
            if (ids.length === 0) return sendSuccess(res, []);
            if (ids.length > 100) return res.status(400).json({error: "ids: max 100 per call"});
            const results = await this.branchService.findByIdsWithRestaurant(ids);
            sendSuccess(res, results.map(toInternalBranchDTO));
        } catch (err) {
            next(err);
        }
    }
}

    function toInternalBranchDTO(r: {branch: any; restaurantStatus: string; restaurantOwnerId: number}) {
        const {branch, restaurantStatus, restaurantOwnerId} = r;
        return {
            id: branch.id,
            restaurantId: branch.restaurantId,
            restaurantOwnerId,
            restaurantStatus,
            region: branch.countryCode,
            isActive: branch.isActive,
            acceptOrders: branch.acceptOrders,
            deliveryFee: branch.deliveryFee,
            // restaurant_branches.commission is stored as a 0-100 percent (the
            // UpdateBranchStatusDTO caps it at 100). Convert to basis points here
            // so consumers can use the standard bps math (× / 10000).
            commissionBps: branch.commission * 100,
            currency: branch.currency,
            lat: Number(branch.lat),
            lng: Number(branch.lng),
            name: branch.label,
            addressText: branch.addressText,
        };
    }





