import { ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { AddressType } from "../enums";
/**
 * Custom validator that ensures lat and lng are required if any location-related field is provided
 */
export declare class IsRequiredIfLocationFieldExists implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class addCustomerAddressDto {
    label: string;
    country: string;
    city: string;
    street: string;
    building?: string;
    apartmentNumber?: string;
    type: AddressType;
    lat: number;
    lng: number;
    isDefault: boolean;
}
export declare class editCustomerAddressesDTO {
    label?: string;
    country?: string;
    city?: string;
    street?: string;
    building?: string;
    apartmentNumber?: string;
    type?: AddressType;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
}
