import { Restaurant } from '../entity/restaurant.entity';
import { Knex } from "knex";
import { FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
export declare function findRestaurantById(id: number): Promise<Restaurant | undefined>;
export declare function createRestaurant(restaurant: Partial<Restaurant>, conn?: Knex): Promise<Restaurant>;
export declare function getAllRestaurants(params: PaginationParams, filters: FilterParams[]): Promise<Restaurant[]>;
export declare function getRestaurants(restaurantIds: number[]): Promise<Restaurant[]>;
export declare function updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant>;
export declare function updatedRestaurantStatus(id: number, status: string, conn?: Knex): Promise<Restaurant>;
