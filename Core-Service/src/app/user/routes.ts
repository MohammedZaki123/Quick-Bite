
import {Router} from "express";
import {UserController} from "./controller/user.controller";
import {authenticate} from "../../lib/auth/guard";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {idempotency} from "../../lib/idempotency/idempotency";
import {requireInternalApiKey} from "../../lib/auth/api-key";

export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

userRouter.get('/me', authenticate, userController.getUserInfo);
userRouter.patch('/me', authenticate, idempotency({strict: false}), userController.editUserInfo);

// Internal (service-to-service)
userRouter.get('/internal/agents/:id', requireInternalApiKey, userController.getAgentById);