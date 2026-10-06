import bcrypt from "bcrypt";
import {env} from "../../lib/config/env";
import jwt, {SignOptions} from "jsonwebtoken";
import crypto from "crypto";

export type JwtPayload = {
    userId: number;
    email: string;
    role: string;
    // for restaurant users only
    restaurantId?: number;
    restaurantRole?: string;
    branchIds?: number[];
}
export  async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}


// for login
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
        expiresIn: Number(env.jwt.accessExpiresIn),
    };
    return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function createRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = {
        expiresIn: Number(env.jwt.refreshExpiresIn),
    };
    return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
        return  jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    // try {
    //     return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
    // } catch (err) {
    //     throw invalidTokenError;
    // }
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;


    // if(!payload){
    //     throw invalidTokenError;
    // }
}
export function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export function hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export function compareOTP(otp: string, hash: string): boolean {
    const otpHash = hashOTP(otp);
    return otpHash === hash;
}