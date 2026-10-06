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
exports.AuthController = void 0;
const auth_service_1 = require("../service/auth.service");
const auth_dto_1 = require("../dto/auth.dto");
const validate_1 = require("../../../lib/validation/validate");
const cookie_1 = require("../../../lib/utils/cookie");
const env_1 = require("../../../lib/config/env");
const time_1 = require("../../../pkg/utils/time");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    signUp = async (req, res, next) => {
        // validate input data using validateBody and RegisterDto
        // call authService.register with validated data
        // return response with user and tokens or catch business logic errors.ts
        try {
            const validatedData = await (0, validate_1.validateBody)(auth_dto_1.RegisterDto, req.body);
            const result = await this.authService.register(validatedData);
            (0, cookie_1.setAuthCookies)(res, result.accessToken, result.refreshToken);
            (0, response_1.sendSuccess)(res, result, 201);
        }
        catch (err) {
            next(err);
        }
    };
    login = async (req, res, next) => {
        // validate input data using validateBody and LoginDto
        // call authService.login with validated data
        // return response with user and tokens or catch business logic errors.ts
        try {
            const validatedData = await (0, validate_1.validateBody)(auth_dto_1.LoginDto, req.body);
            const result = await this.authService.login(validatedData);
            (0, cookie_1.setAuthCookies)(res, result.accessToken, result.refreshToken);
            (0, response_1.sendSuccess)(res, result, 200);
        }
        catch (err) {
            next(err);
        }
    };
    forgetPassword = async (req, res, next) => {
        // validate input data using validateBody and ForgetPasswordDto
        // call authService.forgetPassword with validated data
        // return response with success message
        try {
            const validatedData = await (0, validate_1.validateBody)(auth_dto_1.ForgetPasswordDto, req.body);
            await this.authService.forgetPassword(validatedData);
            (0, response_1.sendSuccess)(res, {
                message: "If an account with the provided email exists, a password reset OTP has been sent."
            });
        }
        catch (err) {
            next(err);
        }
    };
    resetPassword = async (req, res, next) => {
        // validate input data using validateBody and ResetPasswordDto
        // call authService.resetPassword with validated data
        // return response with success message or catch business logic errors.ts
        try {
            const validatedData = await (0, validate_1.validateBody)(auth_dto_1.ResetPasswordDto, req.body);
            await this.authService.resetPassword(validatedData);
            (0, response_1.sendSuccess)(res, {
                message: "Password reset successfully, please login again"
            });
        }
        catch (err) {
            next(err);
        }
    };
    refreshToken = async (req, res, next) => {
        //   validate input data using validateBody and RefreshTokenDto
        //   call authService.refreshToken with validated data
        //   return response with new access token and catch business logic errors.ts
        try {
            const result = await this.authService.refreshToken(req.cookies.refresh_token);
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: env_1.env.isProduction,
                maxAge: (0, time_1.toMs)(1, 'h'),
            });
            (0, response_1.sendSuccess)(res, { message: "success" });
        }
        catch (err) {
            next(err);
        }
    };
    acceptInvite = async (req, res, next) => {
        try {
            const validatedData = await (0, validate_1.validateBody)(auth_dto_1.ResetPasswordDto, req.body);
            const result = await this.authService.acceptInvite(validatedData);
            (0, response_1.sendSuccess)(res, {
                "message": "Invitation accepted successfully, please login again",
            });
        }
        catch (err) {
            next(err);
        }
    };
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
