import { Currency } from "../enum";
export declare class AddBranchDTO {
    lat: number;
    lng: number;
    countryCode: string;
    label: string;
    opensAt: string;
    closesAt: string;
    addressText: string;
    currency: Currency;
    deliveryRadius: number;
}
export declare class PatchBranchDTO {
    lat?: number;
    Lng?: number;
    label?: string;
    opensAt?: string;
    closesAt?: string;
    addressText?: string;
    acceptOrders?: boolean;
    currency?: Currency;
    deliveryFee?: number;
    deliveryRadius?: number;
}
export declare class PatchBranchStatusDTO {
    isActive?: boolean;
    commission?: number;
}
