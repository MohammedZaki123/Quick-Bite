import { passwordReset } from "../entity/password_reset.entity";
import { Knex } from "knex";
export declare function createPasswordResetRequest(reset: Partial<passwordReset>, trx?: Knex.Transaction): Promise<passwordReset>;
export declare function getLatestPasswordResetRequestById(userId: number): Promise<passwordReset | undefined>;
export declare function consumePasswordResetRequest(id: number): Promise<void>;
