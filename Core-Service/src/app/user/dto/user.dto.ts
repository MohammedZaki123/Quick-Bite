import {IsString, MaxLength, MinLength, IsOptional, IsPhoneNumber} from "class-validator";

export class patchUserDto {

    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @MinLength(10)
    @MaxLength(11)
    phone?: string;
}

