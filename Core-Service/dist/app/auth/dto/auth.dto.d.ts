import { SystemRole } from "../../user/enums";
export declare class RegisterRestaurantDTO {
    name: string;
    primaryCountry: string;
    logoURL?: string;
}
export declare class RegisterDto {
    email: string;
    phone: string;
    name: string;
    password: string;
    role: SystemRole;
    restaurant?: RegisterRestaurantDTO;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgetPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}
