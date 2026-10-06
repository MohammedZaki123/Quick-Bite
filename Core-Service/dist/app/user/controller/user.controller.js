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
exports.UserController = void 0;
const user_service_1 = require("../service/user.service");
const validate_1 = require("../../../lib/validation/validate");
const user_dto_1 = require("../dto/user.dto");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    getUserInfo = async (req, res, next) => {
        //     stripe user info from cookie using authenticate middleware
        //     call userService.getUserInfo with user id from token
        //     return response with user info or catch business logic errors.ts
        try {
            const user = await this.userService.getUserInfo(req.user?.userId);
            (0, response_1.sendSuccess)(res, { user });
        }
        catch (err) {
            next(err);
        }
    };
    editUserInfo = async (req, res, next) => {
        try {
            //     validate input data using validateBody and patchUserDto
            //     stripe user info from cookie using authenticate middleware
            //     call userService.updateUserInfo with user id from token and validated data
            //     return response with updated user info or catch business logic errors.ts
            const validatedData = await (0, validate_1.validateBody)(user_dto_1.patchUserDto, req.body);
            const updatedUser = await this.userService.updateUserInfo(req.user?.userId, validatedData);
            (0, response_1.sendSuccess)(res, {
                message: "Profile updated",
                user: updatedUser
            });
        }
        catch (err) {
            next(err);
        }
    };
    getAgentById = async (req, res, next) => {
        try {
            const agentId = Number(req.params.id);
            const agent = await this.userService.getAgentById(agentId);
            (0, response_1.sendSuccess)(res, { agent });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserService)),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
