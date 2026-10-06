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
exports.RestaurantController = void 0;
const restaurant_service_1 = require("../service/restaurant.service");
const validate_1 = require("../../../lib/validation/validate");
const restaurant_dto_1 = require("../dto/restaurant.dto");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../lib/di/tokens");
const response_1 = require("../../../lib/http/response");
const parse_query_1 = require("../../../lib/http/pagination/parse-query");
let RestaurantController = class RestaurantController {
    restaurantService;
    constructor(restaurantService) {
        this.restaurantService = restaurantService;
    }
    createRestaurant = async (req, res, next) => {
        try {
            const validatedData = await (0, validate_1.validateBody)(restaurant_dto_1.CreateRestaurantDTO, req.body);
            const result = await this.restaurantService.createWithOwner(req.user?.role, validatedData);
            (0, response_1.sendSuccess)(res, {
                message: "Restaurant created",
                ...result
            }, 201);
        }
        catch (err) {
            next(err);
        }
    };
    getAllRestaurants = async (req, res, next) => {
        try {
            // createdAt time problem: timestamp response is 2 hours less than actual value stored in database
            // result: cursor pagination result incorrect
            // solution: Just tell frontend team to use nextCursor variable and add two hours to in cursor query parameter variable.
            const params = (0, parse_query_1.parsePaginationQuery)(req.query, ['createdAt', 'name', 'status']);
            const filters = (0, parse_query_1.parseFilterQuery)(req.query, ['id', 'status', 'name']);
            const restaurants = await this.restaurantService.getAllRestaurants(params, filters);
            (0, response_1.sendPaginated)(res, restaurants.data, restaurants.meta);
        }
        catch (err) {
            next(err);
        }
    };
    // getRestaurants = async (req : Request, res: Response, next: NextFunction) => {
    // //     TODO: lat and lng customer validation logic in the middleware layer
    //     try{
    //     //  Validate lat and lng variables in query parameter using DTO and validateBody function
    //      const  validatedData = await validateQuery(GetRestaurantsQueryDTO, req.query)
    //     //  call get restaurants service layer function
    //      const restaurants = await this.restaurantService.getRestaurants(validatedData);
    //      res.status(200).json(restaurants);
    //     }catch(err){
    //         next();
    //     }
    // }
    getRestaurant = async (req, res, next) => {
        try {
            const restaurantId = (0, validate_1.validatePathParameter)(req.params.id, "Restaurant ID");
            const restaurant = await this.restaurantService.getRestaurant(restaurantId);
            (0, response_1.sendSuccess)(res, {
                restaurant
            });
        }
        catch (err) {
            next(err);
        }
    };
    editRestaurant = async (req, res, next) => {
        try {
            const restaurantId = (0, validate_1.validatePathParameter)(req.params.id, "Restaurant ID");
            const validatedData = await (0, validate_1.validateBody)(restaurant_dto_1.PatchRestaurantDTO, req.body);
            const restaurant = await this.restaurantService.editRestaurant(restaurantId, req.user?.userId, req.user?.role, validatedData);
            (0, response_1.sendSuccess)(res, {
                restaurant
            });
        }
        catch (err) {
            next(err);
        }
    };
    editRestaurantStatus = async (req, res, next) => {
        try {
            const restaurantId = (0, validate_1.validatePathParameter)(req.params.id, "Restaurant ID");
            const validatedData = await (0, validate_1.validateBody)(restaurant_dto_1.PatchRestaurantStatusDTO, req.body);
            const restaurant = await this.restaurantService.editRestaurantStatus(restaurantId, req.user?.role, validatedData);
            (0, response_1.sendSuccess)(res, {
                restaurant
            });
        }
        catch (err) {
            next();
        }
    };
};
exports.RestaurantController = RestaurantController;
exports.RestaurantController = RestaurantController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.RestaurantService)),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService])
], RestaurantController);
