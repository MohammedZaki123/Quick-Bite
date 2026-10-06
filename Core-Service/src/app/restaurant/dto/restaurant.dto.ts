import {
    IsEmail,
    IsEnum,
    IsISO31661Alpha2,
    IsNotEmpty,
    IsOptional,
    IsString, IsStrongPassword, MaxLength, MinLength,
    Validate,
    ValidateNested
} from "class-validator";
import { RestaurantStatus } from "../enum";
import {Type} from "class-transformer";





export class CreateRestaurantOwnerDTO {
    @IsEmail()
    email!: string;


    @MinLength(10)
    @MaxLength(11)
    phone!: string;


    @IsString()
    @MinLength(1)
    name!: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }, {
        message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    })
    password!: string;
}

export class CreateRestaurantDTO {
    @ValidateNested()
    @Type(() => CreateRestaurantOwnerDTO)
    owner!: CreateRestaurantOwnerDTO;


    @IsString()
    @IsNotEmpty()
    name! : string;

    @IsString()
    @MinLength(1)
    primaryCountry! : string;

    @IsOptional()
    @IsString()
    logoURL?: string;
}

export class PatchRestaurantDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name? : string;

    @IsOptional()
    @IsString()
    // @IsISO31661Alpha2({ message: 'Invalid country code'})
    primaryCountry? : string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    logoURL?: string;
}

export class PatchRestaurantStatusDTO {
    @IsEnum(RestaurantStatus)
    status!: RestaurantStatus
}