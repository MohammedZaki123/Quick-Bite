import {AppError} from "../../lib/error/AppError";

export const RestaurantDoesNotExist = new AppError('Restaurant Not Found', 404);


export const RestaurantAccessNotAllowed = new AppError('Restaurant Access Denied', 403)


