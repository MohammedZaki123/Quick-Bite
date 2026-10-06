export type JwtPayload = {
    userId: number;
    email: string;
    role: string;
    restaurantId?: number;
    restaurantRole?: string;
    branchIds?: number[];
};
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function createAccessToken(payload: JwtPayload): string;
export declare function createRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function generateOTP(): string;
export declare function hashOTP(otp: string): string;
export declare function compareOTP(otp: string, hash: string): boolean;
