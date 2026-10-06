"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRouter = void 0;
const express_1 = require("express");
const guard_1 = require("../../lib/auth/guard");
const rbac_1 = require("../../lib/auth/rbac");
const container_1 = require("../../lib/di/container");
const tokens_1 = require("../../lib/di/tokens");
const withCache_1 = require("../../lib/cache/withCache");
const idempotency_1 = require("../../lib/idempotency/idempotency");
const api_key_1 = require("../../lib/auth/api-key");
exports.branchRouter = (0, express_1.Router)();
const branchController = container_1.container.resolve(tokens_1.TOKENS.BranchController);
exports.branchRouter.get('/branches/nearby', (0, withCache_1.withCache)(), branchController.getNearbyBranches);
exports.branchRouter.post('/restaurants/:restaurantId/branches', guard_1.authenticate, (0, rbac_1.requireRestaurantMember)('restaurantId'), (0, rbac_1.rbac)({ resource: "core:branch", action: 'create', allowSystemAdmin: true }), (0, idempotency_1.idempotency)({ strict: false }), branchController.addBranch);
exports.branchRouter.get('/restaurants/:restaurantId/branches', branchController.findByRestaurant);
exports.branchRouter.patch('/branches/:id', guard_1.authenticate, (0, rbac_1.requireBranchAccess)('id'), (0, rbac_1.rbac)({ resource: "core:branch", action: 'update', allowSystemAdmin: true }), (0, idempotency_1.idempotency)({ strict: false }), branchController.patchBranch);
exports.branchRouter.patch('/branches/:id/status', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), branchController.patchBranchStatus);
// Internal (service-to-service)
exports.branchRouter.get('/internal/branches', api_key_1.requireInternalApiKey, (0, withCache_1.withCache)(60), branchController.findByIdsWithRestaurant);
exports.branchRouter.get('/internal/branches/:id', api_key_1.requireInternalApiKey, (0, withCache_1.withCache)(60), branchController.findByIdWithRestaurant);
// 30.043304, 31.200782
