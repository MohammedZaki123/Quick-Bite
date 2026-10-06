"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
const branch_repo_1 = require("../repository/branch.repo");
const errors_1 = require("../errors");
const enums_1 = require("../../user/enums");
const restaurant_repo_1 = require("../../restaurant/repository/restaurant.repo");
const errors_2 = require("../../../lib/auth/errors");
const errors_3 = require("../../restaurant/errors");
const tsyringe_1 = require("tsyringe");
const knex_1 = require("../../../lib/knex/knex");
const outbox_repo_1 = require("../../../lib/events/outbox.repo");
const event_types_1 = require("../../../lib/events/event-types");
let BranchService = class BranchService {
    getBranches = async (restaurantID, params, filters) => {
        const branches = await (0, branch_repo_1.getBranchesByRestaurantId)(restaurantID, params, filters);
        return this.filterBranches(branches);
        // return buildPaginationResult(filtered, params.limit, params.sortBy);
    };
    createBranch = async (restaurantID, userId, role, data) => {
        //     place restaurant ID inside DTO cleaned data
        //     call repo layer create branch function giving data as an input
        //     return branch object attributes except restaurantID , createdAt, updatedAt
        //     TODO: we need also to check the role of user if it is an admin or the owner of the restaurant based on restaurant ID
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(restaurantID);
        if (role != enums_1.SystemRole.SYSTEM_ADMIN && (Number(restaurant?.ownerId) !== Number(userId))) {
            throw errors_2.NotAuthorized;
        }
        const now = new Date();
        const branch = await (0, branch_repo_1.createBranch)({
            restaurantId: restaurantID,
            label: data.label,
            countryCode: data.countryCode,
            lat: data.lat,
            lng: data.lng,
            addressText: data.addressText,
            isActive: false,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
            commission: 0,
            createdAt: now,
            updatedAt: now,
            acceptOrders: true
        });
        return branch;
    };
    editBranch = async (branchId, userId, role, data) => {
        // TODO:
        //  check if branch exist and check if restaurant exist
        //  checking the role of user in the system (owner of the restaurant in which branch belongs to and system admin allowed only)
        //  return call repository layer updatedBranch function
        const branch = await (0, branch_repo_1.findBranchById)(branchId);
        if (!branch) {
            throw errors_1.BranchNotFound;
        }
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(branch.restaurantId);
        if (!restaurant) {
            throw errors_3.RestaurantDoesNotExist;
        }
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)) {
            throw errors_2.NotAuthorized;
        }
        const trx = await knex_1.db.transaction();
        try {
            const updated = await (0, branch_repo_1.updateBranch)(branchId, data, trx);
            await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: event_types_1.EVENT_TYPES.BRANCH_UPDATED,
                payload: { branchId },
            });
            await trx.commit();
            return updated;
        }
        catch (error) {
            await trx.rollback();
            throw error;
        }
    };
    editBranchStatus = async (branchId, role, data) => {
        //     TODO:
        //      check if branch exist using branchId
        //      only system admin can change the branch isActive status
        //      call repository layer function updateBranch
        const branch = await (0, branch_repo_1.findBranchById)(branchId);
        if (!branch) {
            throw errors_1.BranchNotFound;
        }
        if (role !== enums_1.SystemRole.SYSTEM_ADMIN) {
            throw errors_2.NotAuthorized;
        }
        const trx = await knex_1.db.transaction();
        try {
            const updated = await (0, branch_repo_1.updateBranchStatus)(branchId, data, trx);
            const eventType = data.isActive === false
                ? event_types_1.EVENT_TYPES.BRANCH_DEACTIVATED
                : event_types_1.EVENT_TYPES.BRANCH_UPDATED;
            await (0, outbox_repo_1.insertOutboxEvent)(trx, {
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType,
                payload: { branchId },
            });
            await trx.commit();
            return updated;
        }
        catch (error) {
            throw error;
        }
    };
    // editBranchRadius = async (branchId: number , data: PutBranchDTO) => {
    // //     TODO:
    // //       this a put operation so i think there is more to conducted on this operation than updated just one field
    // //       only restaurant owner can change the branch delivery radius attribute
    // //       call repository layer function updateBranch
    //     const branch = await updateBranch(branchId, data);
    //     return {
    //         id: branch.id,
    //         label: branch.label,
    //         countryCode: branch.countryCode,
    //         lat: branch.lat,
    //         lng: branch.lng,
    //         isActive: branch.isActive,
    //         opensAt: branch.opensAt,
    //         closesAt: branch.closesAt,
    //         addressText: branch.addressText,
    //         acceptOrders: branch.acceptOrders,
    //         currency: branch.currency,
    //         commission: branch.commission,
    //         deliveryRadius: branch.deliveryRadius
    //     }
    // }
    // findNearBy = async (lat: number, lng: number, params: PaginationParams, filters: FilterParams[]) => {
    //     const branches = await findNearByBranches(lat, lng, params, filters);
    //         return buildPaginationResult(branches, params.limit, params.sortBy);
    //     // return {data: branches, meta: {nextCursor: null, hasMore: false, count: branches.length}};
    // }
    findNearBy = async (lat, lng) => {
        return await (0, branch_repo_1.findNearByBranches)(lat, lng);
    };
    filterBranches(branches) {
        const filteredBranches = [];
        for (let i = 0; i < branches.length; i++) {
            filteredBranches.push({
                id: branches[i].id,
                label: branches[i].label,
                countryCode: branches[i].countryCode,
                lat: branches[i].lat,
                lng: branches[i].lng,
                isActive: branches[i].isActive,
                deliveryRadius: branches[i].deliveryRadius,
                createdAt: branches[i].createdAt,
                updatedAt: branches[i].updatedAt
            });
        }
        return filteredBranches;
    }
    findByIdWithRestaurant = async (branchId) => {
        const branch = await (0, branch_repo_1.findBranchById)(branchId);
        if (!branch)
            return null;
        const restaurant = await (0, restaurant_repo_1.findRestaurantById)(branch.restaurantId);
        if (!restaurant)
            return null;
        return {
            branch,
            restaurantStatus: restaurant.status,
            restaurantOwnerId: restaurant.ownerId,
        };
    };
    findByIdsWithRestaurant = async (branchIds) => {
        if (branchIds.length === 0)
            return [];
        const branches = await (0, branch_repo_1.findBranchesByIds)(branchIds);
        if (branches.length === 0)
            return [];
        const restaurants = await (0, restaurant_repo_1.getRestaurants)(Array.from(new Set(branches.map((b) => b.restaurantId))));
        const byId = new Map(restaurants.map((r) => [Number(r.id), r]));
        const out = [];
        for (const branch of branches) {
            const restaurant = byId.get(Number(branch.restaurantId));
            if (!restaurant)
                continue;
            out.push({
                branch,
                restaurantStatus: restaurant.status,
                restaurantOwnerId: Number(restaurant.ownerId),
            });
        }
        return out;
    };
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, tsyringe_1.injectable)()
], BranchService);
