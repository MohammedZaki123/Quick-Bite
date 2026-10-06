import {AppError} from "../../lib/error/AppError";

export const UserAlreadyExistsError = new AppError('User Already Exists with same phone or email', 400);

export const CannotSignupAsSystemAdmin = new AppError('You cannot register as a system admin', 403);

export const InvalidEmailOrPasswordError = new AppError('Invalid email or password', 401);

export const resetPasswordFailedError = new AppError('no OTP found or latest OTP is expired.', 401);

export const invalidTokenError= new AppError('Invalid Credentials or token is expired', 401);
