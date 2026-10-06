"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyInputData = exports.BranchAccessNotPermitted = exports.BranchNotFound = void 0;
const AppError_1 = require("../../lib/error/AppError");
exports.BranchNotFound = new AppError_1.AppError('Branch ID not found', 404);
exports.BranchAccessNotPermitted = new AppError_1.AppError('Branch Access Denied', 403);
exports.EmptyInputData = new AppError_1.AppError('At least one field must be provided for update', 400);
