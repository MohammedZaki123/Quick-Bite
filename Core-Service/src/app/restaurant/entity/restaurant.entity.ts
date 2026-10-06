import { RestaurantStatus } from "../enum";

export class Restaurant {
    id: number;
    ownerId: number;
    name: string;
    status: RestaurantStatus;
    logoURL: string;
    primaryCountry: string;
    createdAt: Date;
    updatedAt: Date;
    statusUpdatedAt: Date;

    constructor(data: Partial<Restaurant>) {
        this.id = data.id!;
        this.ownerId = data.ownerId!;
        this.name = data.name!;
        this.status = data.status!;
        this.logoURL = data.logoURL?? "";
        this.primaryCountry = data.primaryCountry!;
        this.createdAt = data.createdAt?? new Date();
        this.updatedAt = data.updatedAt?? new Date();
        this.statusUpdatedAt = data.statusUpdatedAt!;
    }
}