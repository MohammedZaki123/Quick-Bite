import { BranchController } from "./controller/branch.controller";

import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import {requireRestaurantMember, requireBranchAccess, rbac} from "../../lib/auth/rbac";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {withCache} from "../../lib/cache/withCache";
import {idempotency} from "../../lib/idempotency/idempotency";
import {requireInternalApiKey} from "../../lib/auth/api-key";

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);


branchRouter.get('/branches/nearby',withCache(),branchController.getNearbyBranches);

branchRouter.post('/restaurants/:restaurantId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:branch", action:'create', allowSystemAdmin: true}),
    idempotency({strict: false}),
    branchController.addBranch);


branchRouter.get('/restaurants/:restaurantId/branches', branchController.findByRestaurant);


branchRouter.patch('/branches/:id',
    authenticate,
    requireBranchAccess('id'),
    rbac({resource:"core:branch", action:'update', allowSystemAdmin: true}),
    idempotency({strict: false}),
    branchController.patchBranch);

branchRouter.patch('/branches/:id/status', authenticate, idempotency({strict: false}), branchController.patchBranchStatus);

// Internal (service-to-service)
branchRouter.get('/internal/branches', requireInternalApiKey, withCache(60), branchController.findByIdsWithRestaurant);

branchRouter.get('/internal/branches/:id', requireInternalApiKey,withCache(60), branchController.findByIdWithRestaurant);




// 30.043304, 31.200782
