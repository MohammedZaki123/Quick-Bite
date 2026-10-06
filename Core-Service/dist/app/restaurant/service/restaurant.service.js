"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const enums_1 = require("../../user/enums");
const errors_1 = require("../errors");
const restaurant_repo_1 = require("../repository/restaurant.repo");
const restaurant_entity_1 = require("../entity/restaurant.entity");
const enum_1 = require("../enum");
const errors_2 = require("../../../lib/auth/errors");
const user_repo_1 = require("../../user/repository/user.repo");
const error_1 = require("../../auth/error");
const knex_1 = require("../../../lib/knex/knex");
const tsyringe_1 = require("tsyringe");
const cursor_pagination_1 = require("../../../lib/http/pagination/cursor-pagination");
const tokens_1 = require("../../../lib/di/tokens");
const user_service_1 = require("../../user/service/user.service");
const member_service_1 = require("../../rbac/service/member.service");
const outbox_repo_1 = require("../../../lib/events/outbox.repo");
const event_types_1 = require("../../../lib/events/event-types");
let RestaurantService = class RestaurantService {
    userService;
    memberService;
    constructor(userService, memberService) {
        this.userService = userService;
        this.memberService = memberService;
    }
    // TODO: the business logic of registering user should be implemented only in auth module service layer and be called by restaurant service layer
    // TODO: the business logic of creating a restaurant should be implemented only in restaurant module service layer and be called by auth service layer
    createWithOwner = async (userRole, data) => {
        if (userRole !== enums_1.SystemRole.SYSTEM_ADMIN) {
            throw errors_2.NotAuthorized;
        }
        if (await (0, user_repo_1.findUserExistsByEmailOrPhone)(data.owner.email, data.owner.phone)) {
            throw error_1.UserAlreadyExistsError;
        }
        const trx = await knex_1.db.transaction();
        const now = new Date();
        const userData = {
            email: data.owner.email,
            phone: data.owner.phone,
            name: data.owner.name,
            password: data.owner.password,
            role: enums_1.SystemRole.RESTAURANT_USER,
        };
        try {
            const user = await this.userService.create(userData, trx);
            const restaurant = await (0, restaurant_repo_1.createRestaurant)(new restaurant_entity_1.Restaurant({
                ownerId: user.id,
                name: data.name,
                logoURL: data.logoURL ?? "",
                primaryCountry: data.primaryCountry,
                status: enum_1.RestaurantStatus.PENDING,
                createdAt: now,
                updatedAt: now,
                statusUpdatedAt: now,
            }), trx);
            const member = await this.memberService.createOwner(restaurant.id, user.id, trx);
            await trx.commit();
            return {
                restaurant,
                owner: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    systemRole: user.systemRole,
                },
            };
        }
        catch (error) {
            await trx.rollback();
            throw error;
        }
    };
    createRestaurant = async (userId, data, trx) => {
        //  call createRestaurant function of repository layer
        //   return restaurant object except createdAt and updatedAt
        //    checking role should be in controller layer or middleware
        const now = new Date();
        const restaurant = await (0, restaurant_repo_1.createRestaurant)(new restaurant_entity_1.Restaurant({
            ownerId: userId,
            name: data.name,
            primaryCountry: data.primaryCountry,
            logoURL: data.logoURL,
            status: enum_1.RestaurantStatus.PENDING,
            createdAt: now,
            updatedAt: now,
            statusUpdatedAt: now
        }), trx);
        return restaurant;
    };
    getAllRestaurants = async (params, filters) => {
        const restaurants = await (0, restaurant_repo_1.getAllRestaurants)(params, filters);
        return (0, cursor_pagination_1.buildPaginationResult)(restaurants, params.limit, params.sortBy);
    };
    // getRestaurants = async (data: GetRestaurantsQueryDTO) => {
    // // call branch module service layer to get restaurant IDs of branches giving lat and lng values
    //     //   NOTE: DO NOT CALL getRestaurantById function based on length of list to avoid n + 1 problem
    //     // check if list returned from branch service layer is not empty
    //     // call repository layer getRestaurants and give returned IDs in a list
    // // store result in a list of type restaurants and return to controller all attributes except createdAt updatedAt and status
    //     const IDs = await branchService.findNearBy(data.lat,data.lng);
    //     if(IDs.length === 0){
    //         return [];
    //     }
    //     const restaurants = await getRestaurants(IDs);
    //
    //     return this.filterRestaurants(restaurants);
    //
    // }
    getRestaurant = async (addressID) => {
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(addressID);
        if (!restaurant) {
            throw errors_1.RestaurantDoesNotExist;
        }
        return {
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
            primaryCountry: restaurant.primaryCountry,
        };
    };
    editRestaurant = async (restaurantID, userId, role, data) => {
        //     if user role is not System Admin and restaurant owner id is not equal to userId input variable
        //     throw unauthorized error
        //      service layer does not care about properties to be updated
        //     this was handled in DTO structural validation logic
        //     call update restaurant of repo layer
        const result = await (0, restaurant_repo_1.findRestaurantById)(restaurantID);
        if (!result) {
            throw errors_1.RestaurantDoesNotExist;
        }
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(result.ownerId)) {
            throw errors_2.NotAuthorized;
        }
        const restaurant = await (0, restaurant_repo_1.updateRestaurant)(restaurantID, data);
        return {
            id: restaurant.id,
            name: restaurant.name,
            logoURL: restaurant.logoURL,
            status: restaurant.status,
            primaryCountry: restaurant.primaryCountry,
            updatedAt: restaurant.updatedAt
        };
    };
    editRestaurantStatus = async (restaurantID, role, data) => {
        //
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN) {
            throw errors_2.NotAuthorized;
        }
        const res = await (0, restaurant_repo_1.findRestaurantById)(restaurantID);
        if (!res) {
            throw errors_1.RestaurantDoesNotExist;
        }
        const trx = await knex_1.db.transaction();
        try {
            const updated = await (0, restaurant_repo_1.updatedRestaurantStatus)(restaurantID, data.status, trx);
            if (data.status === "suspended") {
                await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                    aggregateType: "restaurants",
                    aggregateId: restaurantID,
                    eventType: event_types_1.EVENT_TYPES.RESTAURANT_SUSPENDED,
                    payload: { restaurantId: restaurantID },
                });
            }
            await trx.commit();
            return updated;
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    };
};
exports.RestaurantService = RestaurantService;
exports.RestaurantService = RestaurantService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.UserService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.MemberService)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        member_service_1.MemberService])
], RestaurantService);
