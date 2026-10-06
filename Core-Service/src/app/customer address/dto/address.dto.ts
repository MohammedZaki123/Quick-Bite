import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    Validate,
    MinLength, IsNumber
} from "class-validator";
import {AddressType} from "../enums";
import {IsValidLongitude, IsValidLatitude} from "../../../lib/validation/validate";

/**
 * Custom validator that ensures lat and lng are required if any location-related field is provided
 */
@ValidatorConstraint({ name: 'isRequiredIfLocationFieldExists', async: false })
export class IsRequiredIfLocationFieldExists implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const dto = args.object as editCustomerAddressesDTO;

        // Check if any location-related field exists
        const hasLocationField =
            dto.country !== undefined ||
            dto.city !== undefined ||
            dto.street !== undefined ||
            dto.building !== undefined ||
            dto.apartmentNumber !== undefined;

        // If location field exists, this field (lat or lng) is required
        if (hasLocationField) {
            return value !== undefined && value !== null;
        }

        // Otherwise, it's optional
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} is required when updating location-related fields (country, city, street, building, apartmentNumber)`;
    }
}



export class addCustomerAddressDto {

    @IsString()
    @MinLength(1)
    label!: string;

    @IsString()
    @MinLength(1)
    country!: string

    @IsString()
    @MinLength(1)
    city!: string;

    @IsString()
    @MinLength(1)
    street!: string

    @IsOptional()
    @IsString()
    building?: string;

    @IsOptional()
    @IsString()
    apartmentNumber?: string

    @IsEnum(AddressType)
    type!: AddressType;

    // @Validate(IsValidLatitude)
    @IsNumber()
    lat!: number;

    // @Validate(IsValidLongitude)
    @IsNumber()
    lng!: number;

    @IsBoolean()
    isDefault!: boolean;
}

export class editCustomerAddressesDTO {


    @IsOptional()
    @IsString()
    @MinLength(1)
    label?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    country?: string;



    @IsOptional()
    @IsString()
    @MinLength(1)
    city?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    street?: string;

    @IsOptional()
    @IsString()
    building?: string;

    @IsOptional()
    @IsString()
    apartmentNumber?: string;

    @IsOptional()
    @IsEnum(AddressType)
    type?: AddressType;

    // @Validate(IsRequiredIfLocationFieldExists)
    // @Validate(IsValidLatitude)
    @IsOptional()
    @IsNumber()
    lat?: number;

    // @Validate(IsRequiredIfLocationFieldExists)
    // @Validate(IsValidLongitude)
    @IsOptional()
    @IsNumber()
    lng?: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

