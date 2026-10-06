"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantAccessNotAllowed = exports.RestaurantDoesNotExist = void 0;
const AppError_1 = require("../../lib/error/AppError");
exports.RestaurantDoesNotExist = new AppError_1.AppError('Restaurant Not Found', 404);
exports.RestaurantAccessNotAllowed = new AppError_1.AppError('Restaurant Access Denied', 403);
