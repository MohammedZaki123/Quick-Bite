import {SystemRole} from "../../user/enums";
import {
    IsEmail,
    IsEnum,
    IsNotEmpty, IsOptional,
    IsPhoneNumber,
    IsString,
    IsStrongPassword,
    Length,
    MaxLength,
    MinLength, ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export class RegisterRestaurantDTO {
    @IsString()
    @MinLength(1)
    name! : string;


    @IsString()
    @MinLength(1)
    primaryCountry! : string;

    @IsOptional()
    @IsString()
    logoURL? : string;
}


export class RegisterDto {
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

    @IsEnum(SystemRole)
    // checks that input role is a member of the SystemRole enum, which includes 'customer', 'restaurant_user', and 'delivery_agent'
    role!: SystemRole;

    @IsOptional()
    @ValidateNested()
    @Type(() => RegisterRestaurantDTO)
    restaurant?: RegisterRestaurantDTO;
}


export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class ForgetPasswordDto {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
    @IsEmail()
    email!: string;

    @IsString()
    @Length(6)
    otp!: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }, {
        message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    })
    newPassword!: string;
}



