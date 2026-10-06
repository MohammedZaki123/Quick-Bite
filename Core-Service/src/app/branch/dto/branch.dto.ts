import {IsValidLongitude, IsValidLatitude} from "../../../lib/validation/validate";
import {
    IsBoolean,
    IsDecimal,
    IsEnum, IsInt,
    IsISO31661Alpha2,
    IsNotEmpty, IsNumber, IsOptional,
    IsString,
    IsTimeZone, Max, Min,
    Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface
} from "class-validator";
import {Currency} from "../enum";
import {editCustomerAddressesDTO} from "../../customer address/dto/address.dto";


export class AddBranchDTO {
    @IsNumber()
    lat! : number;

    @IsNumber()
    lng!: number;

    @IsString()
    @IsNotEmpty()
    @IsISO31661Alpha2({ message: 'Invalid country code'})
    countryCode!: string;


    @IsString()
    @IsNotEmpty()
    label!: string;



    // i think it needs custom validation specifically to check if it is a valid time
    @IsString()
    opensAt!: string;

    // i think it needs custom validation specifically to check if it is a valid time
    @IsString()
    closesAt!: string;

    @IsString()
    @IsNotEmpty()
    addressText!: string;


    @IsEnum(Currency)
    currency!: Currency;


    @IsInt()
    @Min(0)
    deliveryRadius!: number
}


// @ValidatorConstraint({ name: 'isRequiredIfLocationFieldExists', async: false })
// export class IsRequiredIfLocationFieldExists implements ValidatorConstraintInterface {
//     validate(value: any, args: ValidationArguments) {
//         const dto = args.object as PatchBranchDTO;
//
//         // Check if any location-related field exists
//         const hasLocationField =
//             dto.countryCode !== undefined ||
//             dto.label !== undefined ||
//             dto.addressText !== undefined ||
//             dto.deliveryRadius !== undefined;
//
//         // If location field exists, this field (lat or lng) is required
//         if (hasLocationField) {
//             return value !== undefined && value !== null;
//         }
//
//         // Otherwise, it's optional
//         return true;
//     }
//
//     defaultMessage(args: ValidationArguments) {
//         return `${args.property} is required when updating location-related fields (country, city, street, building, apartmentNumber)`;
//     }
// }

export class PatchBranchDTO {
    // @Validate(IsRequiredIfLocationFieldExists)
    @IsOptional()
    // @Validate(IsValidLatitude)
    @IsNumber()
    lat? : number;

    // @Validate(IsRequiredIfLocationFieldExists)
    @IsOptional()
    // @Validate(IsValidLongitude)
    @IsNumber()
    Lng?: number;



    @IsOptional()
    @IsString()
    @IsNotEmpty()
    label?: string;





    // i think it needs custom validation specifically to check if it is a valid time
    @IsOptional()
    @IsString()
    opensAt?: string;

    // i think it needs custom validation specifically to check if it is a valid time
    @IsOptional()
    @IsString()
    closesAt?: string;


    @IsOptional()
    @IsString()
    @IsNotEmpty()
    addressText?: string;


    @IsOptional()
    @IsBoolean()
    acceptOrders?: boolean;

    @IsOptional()
    @IsEnum(Currency)
    currency?: Currency;

    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryFee?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryRadius?: number
}

export class PatchBranchStatusDTO {
    @IsOptional()
    @IsBoolean()
    isActive? : boolean

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    commission? : number;
}
// export class PutBranchDTO {
//     @IsInt()
//     deliveryRadius!: number
// }

