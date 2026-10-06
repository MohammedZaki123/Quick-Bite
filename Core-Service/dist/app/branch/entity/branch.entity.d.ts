import { Currency } from "../enum";
export declare class Branch {
    id: number;
    restaurantId: number;
    countryCode: string;
    addressText: string;
    label: string;
    lat: number;
    lng: number;
    isActive: boolean;
    opensAt: string;
    closesAt: string;
    acceptOrders: boolean;
    createdAt: Date;
    updatedAt: Date;
    deliveryRadius: number;
    deliveryFee: number;
    currency: Currency;
    commission: number;
    location?: number;
    constructor(data: Partial<Branch>);
}
