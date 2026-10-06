import { RestaurantService } from "../service/restaurant.service";
import { NextFunction, Request, Response } from "express";
export declare class RestaurantController {
    private readonly restaurantService;
    constructor(restaurantService: RestaurantService);
    createRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllRestaurants: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editRestaurantStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
