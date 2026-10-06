import {RestaurantController} from "./controller/restaurant.controller";
import {Router} from "express";
// import {branchRouter} from "../branch/routes";
import {authenticate} from "../../lib/auth/guard";
import {requireRestaurantMember, rbac} from "../../lib/auth/rbac";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {idempotency} from "../../lib/idempotency/idempotency";
import {withCache} from "../../lib/cache/withCache";

export const restaurantRouter = Router();

const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);



restaurantRouter.get('/', restaurantController.getAllRestaurants)

// for admin and owner
restaurantRouter.post('', authenticate, idempotency({strict: false}), restaurantController.createRestaurant)
//
restaurantRouter.get('/:id', restaurantController.getRestaurant);
//
//
// the following update endpoint expects any property to be updated except id and status
restaurantRouter.patch('/:id',
    authenticate,
    requireRestaurantMember('id'),
    rbac({resource:"core:restaurant", action:'update', allowSystemAdmin: true}),
    idempotency({strict: false}),
    restaurantController.editRestaurant);
//
//
// the following update endpoint expects status property to contain status in request body
restaurantRouter.patch('/:id/status', authenticate, idempotency({strict: false}), restaurantController.editRestaurantStatus);

