"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = void 0;
const AppError_1 = require("../../lib/error/AppError");
exports.UserNotFoundError = new AppError_1.AppError('User not found', 404);
