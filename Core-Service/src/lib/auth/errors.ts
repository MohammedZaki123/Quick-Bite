import {AppError} from "../error/AppError";

export const NotAuthenticated = new AppError('Not authenticated', 401);

export const RestaurantDataRequiredError = new AppError('Restaurant data is required to register', 400);

export const NotAuthorized = new AppError("user not authorized", 403);