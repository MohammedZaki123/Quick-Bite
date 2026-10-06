import { ForgetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from "../dto/auth.dto";
import { SystemRole } from "../../user/enums";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { UserService } from "../../user/service/user.service";
import { MemberService } from "../../rbac/service/member.service";
import type { IEmailProvider } from "../../../pkg/email/email.interface";
export declare class AuthService {
    private readonly restaurantService;
    private readonly userService;
    private readonly memberService;
    private readonly emailService;
    constructor(restaurantService: RestaurantService, userService: UserService, memberService: MemberService, emailService: IEmailProvider);
    register: (data: RegisterDto) => Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            phone: string;
            name: string;
            systemRole: SystemRole;
            createdAt: Date;
        };
        restaurant: import("../../restaurant/entity/restaurant.entity").Restaurant | undefined;
    }>;
    login: (data: LoginDto) => Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            phone: string;
            name: string;
            systemRole: SystemRole;
            createdAt: Date;
        };
    }>;
    forgetPassword: (data: ForgetPasswordDto) => Promise<void>;
    resetPassword: (data: ResetPasswordDto) => Promise<import("../../user/entity/user.entity").User | undefined>;
    refreshToken: (refreshToken: string) => Promise<{
        accessToken: string;
    }>;
    acceptInvite: (data: ResetPasswordDto) => Promise<void>;
}
