"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAuthorized = exports.RestaurantDataRequiredError = exports.NotAuthenticated = void 0;
const AppError_1 = require("../error/AppError");
exports.NotAuthenticated = new AppError_1.AppError('Not authenticated', 401);
exports.RestaurantDataRequiredError = new AppError_1.AppError('Restaurant data is required to register', 400);
exports.NotAuthorized = new AppError_1.AppError("user not authorized", 403);
