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
exports.BranchController = void 0;
const branch_service_1 = require("../service/branch.service");
const validate_1 = require("../../../lib/validation/validate");
const branch_dto_1 = require("../dto/branch.dto");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
const errors_1 = require("../errors");
let BranchController = class BranchController {
    branchService;
    constructor(branchService) {
        this.branchService = branchService;
    }
    addBranch = async (req, res, next) => {
        try {
            const restaurantId = (0, validate_1.validatePathParameter)(req.params.restaurantId, "Restaurant ID");
            const validatedData = await (0, validate_1.validateBody)(branch_dto_1.AddBranchDTO, req.body);
            const userId = req.user?.userId;
            const role = req.user?.role;
            const branch = await this.branchService.createBranch(restaurantId, userId, role, validatedData);
            (0, response_1.sendSuccess)(res, branch, 201);
        }
        catch (err) {
            next(err);
        }
    };
    getNearbyBranches = async (req, res, next) => {
        try {
            const lat = Number(req.query.lat);
            const lng = Number(req.query.lng);
            // const params: PaginationParams = parsePaginationQuery(req.query, ['restaurantId','commission']);
            // const filters = parseFilterQuery(req.query, ['commission', 'restaurantId', 'currency']);
            // const result = await this.branchService.findNearBy(lat, lng, params, filters);
            const result = await this.branchService.findNearBy(lat, lng);
            // sendPaginated(res, result.data, result.meta);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    };
    findByRestaurant = async (req, res, next) => {
        try {
            const restaurantId = (0, validate_1.validatePathParameter)(req.params.restaurantId, "Restaurant ID");
            // const params: PaginationParams = parsePaginationQuery(req.query);
            // const filters = parseFilterQuery(req.query, ['id', 'label', 'currency', 'is_active']);
            const result = await this.branchService.getBranches(restaurantId);
            // sendPaginated(res, result.data, result.meta);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    };
    patchBranch = async (req, res, next) => {
        try {
            const branchId = (0, validate_1.validatePathParameter)(req.params.id, "Branch ID");
            const validatedData = await (0, validate_1.validateBody)(branch_dto_1.PatchBranchDTO, req.body);
            const branch = await this.branchService.editBranch(branchId, req.user?.userId, req.user?.role, validatedData);
            (0, response_1.sendSuccess)(res, {
                branch
            });
        }
        catch (err) {
            next(err);
        }
    };
    patchBranchStatus = async (req, res, next) => {
        try {
            const branchId = (0, validate_1.validatePathParameter)(req.params.id, "Branch ID");
            const validatedData = await (0, validate_1.validateBody)(branch_dto_1.PatchBranchStatusDTO, req.body);
            const branch = await this.branchService.editBranchStatus(branchId, req.user?.role, validatedData);
            (0, response_1.sendSuccess)(res, {
                branch: {
                    id: branch.id,
                    isActive: branch.isActive,
                    acceptOrders: branch.acceptOrders,
                    commission: branch.commission
                }
            });
        }
        catch (err) {
            next(err);
        }
    };
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
    findByIdWithRestaurant = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const result = await this.branchService.findByIdWithRestaurant(id);
            if (!result)
                throw errors_1.BranchNotFound;
            (0, response_1.sendSuccess)(res, toInternalBranchDTO(result));
        }
        catch (err) {
            next(err);
        }
    };
    findByIdsWithRestaurant = async (req, res, next) => {
        try {
            const raw = String(req.query.ids ?? "").trim();
            if (!raw)
                return (0, response_1.sendSuccess)(res, []);
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
            if (ids.length === 0)
                return (0, response_1.sendSuccess)(res, []);
            if (ids.length > 100)
                return res.status(400).json({ error: "ids: max 100 per call" });
            const results = await this.branchService.findByIdsWithRestaurant(ids);
            (0, response_1.sendSuccess)(res, results.map(toInternalBranchDTO));
        }
        catch (err) {
            next(err);
        }
    };
};
exports.BranchController = BranchController;
exports.BranchController = BranchController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.BranchService)),
    __metadata("design:paramtypes", [branch_service_1.BranchService])
], BranchController);
function toInternalBranchDTO(r) {
    const { branch, restaurantStatus, restaurantOwnerId } = r;
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
