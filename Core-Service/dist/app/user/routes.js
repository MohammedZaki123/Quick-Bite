"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const guard_1 = require("../../lib/auth/guard");
const container_1 = require("../../lib/di/container");
const tokens_1 = require("../../lib/di/tokens");
const idempotency_1 = require("../../lib/idempotency/idempotency");
const api_key_1 = require("../../lib/auth/api-key");
exports.userRouter = (0, express_1.Router)();
const userController = container_1.container.resolve(tokens_1.TOKENS.UserController);
exports.userRouter.get('/me', guard_1.authenticate, userController.getUserInfo);
exports.userRouter.patch('/me', guard_1.authenticate, (0, idempotency_1.idempotency)({ strict: false }), userController.editUserInfo);
// Internal (service-to-service)
exports.userRouter.get('/internal/agents/:id', api_key_1.requireInternalApiKey, userController.getAgentById);
