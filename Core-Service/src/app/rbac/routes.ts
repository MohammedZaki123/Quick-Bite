import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import {requireRestaurantMember, rbac} from "../../lib/auth/rbac";
import {MemberController} from "./controller/member.controller";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {idempotency} from "../../lib/idempotency/idempotency";
import {requireInternalApiKey} from "../../lib/auth/api-key";

export const rbacRouter = Router();

const memberController = container.resolve<MemberController>(TOKENS.MemberController);

rbacRouter.get('/roles/:role/permissions',
    memberController.getRolePermissions
);
rbacRouter.get('/internal/rbac/permissions', requireInternalApiKey, memberController.getPermissionsByRole);


rbacRouter.post('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'create', allowSystemAdmin: true}),
    idempotency({strict: true}),
    memberController.createMember
);

rbacRouter.get('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'read', allowSystemAdmin: true}),
    memberController.listMembers
);

rbacRouter.patch('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update', allowSystemAdmin: true}),
    memberController.updateMember
);

rbacRouter.delete('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'delete', allowSystemAdmin: true}),
    memberController.deleteMember
);

rbacRouter.put('/restaurants/:restaurantId/members/:memberId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update', allowSystemAdmin: true}),
    idempotency({strict: false}),
    memberController.updateMemberBranches
);
