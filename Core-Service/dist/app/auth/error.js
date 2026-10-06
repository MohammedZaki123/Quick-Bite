"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidTokenError = exports.resetPasswordFailedError = exports.InvalidEmailOrPasswordError = exports.CannotSignupAsSystemAdmin = exports.UserAlreadyExistsError = void 0;
const AppError_1 = require("../../lib/error/AppError");
exports.UserAlreadyExistsError = new AppError_1.AppError('User Already Exists with same phone or email', 400);
exports.CannotSignupAsSystemAdmin = new AppError_1.AppError('You cannot register as a system admin', 403);
exports.InvalidEmailOrPasswordError = new AppError_1.AppError('Invalid email or password', 401);
exports.resetPasswordFailedError = new AppError_1.AppError('no OTP found or latest OTP is expired.', 401);
exports.invalidTokenError = new AppError_1.AppError('Invalid Credentials or token is expired', 401);
