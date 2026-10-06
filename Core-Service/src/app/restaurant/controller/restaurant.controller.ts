import {RestaurantService} from "../service/restaurant.service";
import {NextFunction, Request, Response} from "express";
import {validateBody, validatePathParameter, validateQuery} from "../../../lib/validation/validate";
import {createRestaurant} from "../repository/restaurant.repo";
import {
   CreateRestaurantDTO,
    PatchRestaurantDTO,
    PatchRestaurantStatusDTO
} from "../dto/restaurant.dto";
import {Restaurant} from "../entity/restaurant.entity";
import {SystemRole} from "../../user/enums";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendPaginated, sendSuccess} from "../../../lib/http/response";
import {parseFilterQuery, parsePaginationQuery} from "../../../lib/http/pagination/parse-query";
import {PaginationParams} from "../../../lib/http/pagination/cursor-pagination";

@injectable()
export class RestaurantController{
    constructor (@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService){

    }
    createRestaurant = async (req : Request, res: Response, next: NextFunction) => {
        try{
            const validatedData = await validateBody(CreateRestaurantDTO, req.body);
            const result = await this.restaurantService.createWithOwner(req.user?.role! as SystemRole,validatedData);
            sendSuccess(res, {
                message: "Restaurant created",
                ...result
            }, 201);
        }catch(err){
            next(err);
        }
    }

    getAllRestaurants = async (req : Request, res: Response, next: NextFunction) => {
        try{
            // createdAt time problem: timestamp response is 2 hours less than actual value stored in database
            // result: cursor pagination result incorrect
            // solution: Just tell frontend team to use nextCursor variable and add two hours to in cursor query parameter variable.
            const params: PaginationParams = parsePaginationQuery(req.query,['createdAt','name','status']);
            const filters = parseFilterQuery(req.query,['id','status','name']);
            const restaurants = await this.restaurantService.getAllRestaurants(params, filters);
            sendPaginated(res,restaurants.data,restaurants.meta)
        }catch(err) {
            next(err);
        }
    }
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

    getRestaurant = async (req : Request, res: Response, next: NextFunction) => {
        try{
            const restaurantId = validatePathParameter(req.params.id, "Restaurant ID");
            const restaurant = await this.restaurantService.getRestaurant(restaurantId);
            sendSuccess(res, {
                restaurant
            });
        }catch(err){
            next(err);
        }
    }

    editRestaurant = async (req : Request, res: Response, next: NextFunction) => {
        try{

            const restaurantId = validatePathParameter(req.params.id, "Restaurant ID");
            const validatedData = await validateBody(PatchRestaurantDTO, req.body);
            const restaurant = await this.restaurantService.editRestaurant(restaurantId, req.user?.userId!, req.user?.role! as SystemRole,validatedData);
            sendSuccess(res, {
                restaurant
            });
        }catch(err){
            next(err);
        }
    }
    editRestaurantStatus = async (req : Request, res: Response, next: NextFunction) => {
        try{
            const restaurantId = validatePathParameter(req.params.id, "Restaurant ID");
            const validatedData = await validateBody(PatchRestaurantStatusDTO, req.body);
            const restaurant = await this.restaurantService.editRestaurantStatus(restaurantId, req.user?.role as SystemRole,validatedData);
            sendSuccess(res, {
                restaurant
            });
        }catch(err){
            next();
        }
    }
}

