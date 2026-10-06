import { MemberStatus } from "../enums";
export declare class RestaurantMember {
    id: number;
    userId: number;
    restaurantId: number;
    roleId: number;
    status: MemberStatus;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<RestaurantMember>);
}
