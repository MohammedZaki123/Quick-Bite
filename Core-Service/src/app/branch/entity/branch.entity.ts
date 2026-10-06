import {Currency} from "../enum";
export class Branch {
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
    commission: number;// SMALLINT
    location?: number
    constructor(data: Partial<Branch>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.lat = data.lat!;
        this.lng = data.lng!;
        this.countryCode = data.countryCode!;
        this.label = data.label!;
        this.isActive = data.isActive!;
        this.opensAt = data.opensAt!;
        this.closesAt = data.closesAt!;
        this.addressText = data.addressText!;
        this.acceptOrders = data.acceptOrders!;
        this.createdAt = data.createdAt?? new Date();
        this.updatedAt = data.updatedAt?? new Date();
        this.currency = data.currency!;
        this.commission = data.commission?? 0;
        this.deliveryRadius = data.deliveryRadius?? 0;
        this.deliveryFee = data.deliveryFee?? 0;
    }
}
