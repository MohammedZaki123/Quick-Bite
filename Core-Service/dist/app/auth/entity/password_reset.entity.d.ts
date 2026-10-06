export declare class passwordReset {
    id: number;
    userId: number;
    otpHash: string;
    expiresAt: Date;
    createdAt: Date;
    consumedAt: Date | null;
    constructor(data: Partial<passwordReset>);
    is_expired(): boolean;
}
