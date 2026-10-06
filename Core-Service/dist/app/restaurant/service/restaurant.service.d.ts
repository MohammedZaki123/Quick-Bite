import { CreateRestaurantDTO, PatchRestaurantDTO, PatchRestaurantStatusDTO } from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import { Restaurant } from "../entity/restaurant.entity";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { RestaurantStatus } from "../enum";
import { Knex } from "knex";
import { FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
import { UserService } from "../../user/service/user.service";
import { MemberService } from "../../rbac/service/member.service";
export declare class RestaurantService {
    private readonly userService;
    private readonly memberService;
    constructor(userService: UserService, memberService: MemberService);
    createWithOwner: (userRole: SystemRole, data: CreateRestaurantDTO) => Promise<{
        restaurant: Restaurant;
        owner: {
            id: number;
            email: string;
            phone: string;
            name: string;
            systemRole: SystemRole;
        };
    }>;
    createRestaurant: (userId: number, data: RegisterRestaurantDTO, trx: Knex) => Promise<Restaurant>;
    getAllRestaurants: (params: PaginationParams, filters: FilterParams[]) => Promise<{
        data: Restaurant[];
        meta: import("../../../lib/http/pagination/cursor-pagination").PaginationMeta;
    }>;
    getRestaurant: (addressID: number) => Promise<{
        id: number;
        name: string;
        status: RestaurantStatus;
        primaryCountry: string;
    }>;
    editRestaurant: (restaurantID: number, userId: number, role: SystemRole, data: PatchRestaurantDTO) => Promise<{
        id: number;
        name: string;
        logoURL: string;
        status: RestaurantStatus;
        primaryCountry: string;
        updatedAt: Date;
    }>;
    editRestaurantStatus: (restaurantID: number, role: SystemRole, data: PatchRestaurantStatusDTO) => Promise<Restaurant>;
}
