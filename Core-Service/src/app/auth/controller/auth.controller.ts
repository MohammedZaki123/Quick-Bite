import {AuthService} from '../service/auth.service';
import {ForgetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto} from '../dto/auth.dto';
import {NextFunction, Request, Response} from "express";
import {validateBody} from "../../../lib/validation/validate";
import {setAuthCookies} from "../../../lib/utils/cookie";
import {env} from "../../../lib/config/env";
import {toMs} from "../../../pkg/utils/time";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess} from "../../../lib/http/response";

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) {
    }

    signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // validate input data using validateBody and RegisterDto
        // call authService.register with validated data
        // return response with user and tokens or catch business logic errors.ts
        try {
            const validatedData = await validateBody(RegisterDto, req.body);
            const result = await this.authService.register(validatedData);
            setAuthCookies(res,result.accessToken, result.refreshToken)
            sendSuccess(res, result, 201);
        } catch (err) {
            next(err);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // validate input data using validateBody and LoginDto
        // call authService.login with validated data
        // return response with user and tokens or catch business logic errors.ts

        try {
            const validatedData = await validateBody(LoginDto, req.body);
            const result = await this.authService.login(validatedData);
            setAuthCookies(res,result.accessToken, result.refreshToken)
            sendSuccess(res, result, 200);
        } catch (err) {
            next(err);
        }
    }

    forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // validate input data using validateBody and ForgetPasswordDto
        // call authService.forgetPassword with validated data
        // return response with success message

        try {
            const validatedData = await validateBody(ForgetPasswordDto, req.body);
            await this.authService.forgetPassword(validatedData);
            sendSuccess(res, {
                message: "If an account with the provided email exists, a password reset OTP has been sent."
            })
        } catch (err) {
            next(err);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // validate input data using validateBody and ResetPasswordDto
        // call authService.resetPassword with validated data
        // return response with success message or catch business logic errors.ts

        try {
            const validatedData = await validateBody(ResetPasswordDto, req.body);
            await this.authService.resetPassword(validatedData);
            sendSuccess(res, {
                message: "Password reset successfully, please login again"
            });
        } catch (err) {
            next(err);
        }
    }
    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        //   validate input data using validateBody and RefreshTokenDto
        //   call authService.refreshToken with validated data
        //   return response with new access token and catch business logic errors.ts
        try {
            const result = await this.authService.refreshToken(req.cookies.refresh_token);
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: env.isProduction,
                maxAge: toMs(1, 'h'),
            });
            sendSuccess(res, {message: "success"});
        } catch(err) {
            next(err);
        }
    }

    acceptInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try{
            const validatedData = await validateBody(ResetPasswordDto,req.body);
            const result = await this.authService.acceptInvite(validatedData);
            sendSuccess(res, {
                "message": "Invitation accepted successfully, please login again",
            });
        }catch(err){
            next(err);
        }
    }
}
