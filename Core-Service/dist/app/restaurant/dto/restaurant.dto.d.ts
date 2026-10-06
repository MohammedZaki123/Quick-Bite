import { RestaurantStatus } from "../enum";
export declare class CreateRestaurantOwnerDTO {
    email: string;
    phone: string;
    name: string;
    password: string;
}
export declare class CreateRestaurantDTO {
    owner: CreateRestaurantOwnerDTO;
    name: string;
    primaryCountry: string;
    logoURL?: string;
}
export declare class PatchRestaurantDTO {
    name?: string;
    primaryCountry?: string;
    logoURL?: string;
}
export declare class PatchRestaurantStatusDTO {
    status: RestaurantStatus;
}
