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
exports.MemberController = void 0;
const member_service_1 = require("../service/member.service");
const validate_1 = require("../../../lib/validation/validate");
const member_dto_1 = require("../dto/member.dto");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
const errors_1 = require("../errors");
let MemberController = class MemberController {
    memberService;
    constructor(memberService) {
        this.memberService = memberService;
    }
    createMember = async (req, res, next) => {
        try {
            //     validate body of DTO
            const validatedData = await (0, validate_1.validateBody)(member_dto_1.CreateMemberDto, req.body);
            const result = await this.memberService.createMember(Number(req.params.restaurantId), validatedData);
            (0, response_1.sendSuccess)(res, result, 201);
        }
        catch (err) {
            next(err);
        }
    };
    listMembers = async (req, res, next) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            // const params: PaginationParams = parsePaginationQuery(req.query, ['email','userId']);
            // const filters = parseFilterQuery(req.query, ['userId', 'email','status']);
            const result = await this.memberService.listMembers(restaurantId);
            (0, response_1.sendPaginated)(res, result.data, result.meta);
        }
        catch (err) {
            next(err);
        }
    };
    updateMember = async (req, res, next) => {
        try {
            const validatedData = await (0, validate_1.validateBody)(member_dto_1.UpdateMemberDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            const result = await this.memberService.updateMember(restaurantId, memberId, validatedData);
            (0, response_1.sendSuccess)(res, { message: "Member updated successfully", data: result });
        }
        catch (err) {
            next(err);
        }
    };
    deleteMember = async (req, res, next) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            await this.memberService.deleteMember(restaurantId, memberId);
            (0, response_1.sendSuccess)(res, { message: "Member deleted successfully" });
        }
        catch (err) {
            next(err);
        }
    };
    updateMemberBranches = async (req, res, next) => {
        try {
            const validatedData = await (0, validate_1.validateBody)(member_dto_1.UpdateMemberBranchesDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);
            await this.memberService.updateMemberBranches(restaurantId, memberId, validatedData);
            (0, response_1.sendSuccess)(res, { message: "Member branches updated successfully" });
        }
        catch (err) {
            next(err);
        }
    };
    getRolePermissions = async (req, res, next) => {
        try {
            const roleName = String(req.params.role);
            const result = await this.memberService.getRolePermissions(roleName);
            (0, response_1.sendSuccess)(res, { data: result });
        }
        catch (err) {
            next(err);
        }
    };
    getPermissionsByRole = async (req, res, next) => {
        try {
            const role = String(req.query.role ?? "");
            if (!role)
                throw errors_1.RoleQueryRequiredError;
            const result = await this.memberService.getPermissionsByRole(role);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.MemberController = MemberController;
exports.MemberController = MemberController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.MemberService)),
    __metadata("design:paramtypes", [member_service_1.MemberService])
], MemberController);
