
export class passwordReset {
    id: number;
    userId: number;
    otpHash: string;
    expiresAt: Date;
    createdAt: Date;
    consumedAt: Date | null;

    constructor(data: Partial<passwordReset>) {
        this.id = data.id!;
        this.userId = data.userId!;
        this.otpHash = data.otpHash!;
        this.expiresAt = data.expiresAt!;
        this.createdAt = data.createdAt!;
        this.consumedAt = data.consumedAt || null;
    }

    is_expired(): boolean {
        return new Date() > this.expiresAt;
    }

}