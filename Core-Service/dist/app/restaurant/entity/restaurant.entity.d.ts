import { RestaurantStatus } from "../enum";
export declare class Restaurant {
    id: number;
    ownerId: number;
    name: string;
    status: RestaurantStatus;
    logoURL: string;
    primaryCountry: string;
    createdAt: Date;
    updatedAt: Date;
    statusUpdatedAt: Date;
    constructor(data: Partial<Restaurant>);
}
