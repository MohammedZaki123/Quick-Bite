import { AddressType } from "../enums";
export declare class CustomerAddress {
    id: number;
    userId: number;
    label: string;
    country: string;
    city: string;
    street: string;
    building: string | null;
    apartmentNumber: string | null;
    type: AddressType;
    lat: number;
    lng: number;
    isDefault: boolean;
    createdAt: Date;
    constructor(data: Partial<CustomerAddress>);
}
