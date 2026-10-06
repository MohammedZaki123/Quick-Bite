import {
    IsArray,
    IsEmail,
    IsEnum, IsIn, IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";
import {MemberStatus} from "../enums";

export class CreateMemberDto {
    @IsEmail()
    email!: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name!: string;

    @IsString()
    @MinLength(10)
    @MaxLength(11)
    phone!: string


    @IsString()
    @IsNotEmpty()
    role!: string;

    @IsOptional()
    @IsArray()
    branchIds?: number[];

}

export class UpdateMemberDTO {
    @IsOptional()
    @IsString()
    role?: string

    @IsOptional()
    @IsEnum(MemberStatus)
    status?: MemberStatus
}

export class UpdateMemberBranchesDTO {
    @IsArray()
    branchIds!: number[]
}

