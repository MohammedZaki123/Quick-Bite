"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantRouter = void 0;
const express_1 = require("express");
// import {branchRouter} from "../branch/routes";
const guard_1 = require("../../lib/auth/guard");
const rbac_1 = require("../../lib/auth/rbac");
const container_1 = require("../../lib/di/container");
const tokens_1 = require("../../lib/di/tokens");
const idempotency_1 = require("../../lib/idempotency/idempotency");
exports.restaurantRouter = (0, express_1.Router)();
const restaurantController = container_1.container.resolve(tokens_1.TOKENS.RestaurantController);
exports.restaurantRouter.get('/', restaurantController.getAllRestaurants);
// for admin and owner
exports.restaurantRouter.post('', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), restaurantController.createRestaurant);
//
exports.restaurantRouter.get('/:id', restaurantController.getRestaurant);
//
//
// the following update endpoint expects any property to be updated except id and status
exports.restaurantRouter.patch('/:id', guard_1.authenticate, (0, rbac_1.requireRestaurantMember)('id'), (0, rbac_1.rbac)({ resource: "core:restaurant", action: 'update', allowSystemAdmin: true }), (0, idempotency_1.idempotency)({ strict: false }), restaurantController.editRestaurant);
//
//
// the following update endpoint expects status property to contain status in request body
exports.restaurantRouter.patch('/:id/status', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), restaurantController.editRestaurantStatus);
