import {passwordReset} from "../entity/password_reset.entity";
import {db} from "../../../lib/knex/knex";
import {Knex} from "knex";

function toEntity(record: any): passwordReset {
    return new passwordReset({
        id: record.id,
        userId: record.user_id,
        otpHash: record.otp_hash,
        expiresAt: record.expires_at,
        createdAt: record.created_at,
        consumedAt: record.consumed_at
    });
}
const PASSWORD_RESET_COLUMNS = [
    "id", "user_id", "otp_hash", "expires_at", "created_at", "consumed_at"
]

export async function createPasswordResetRequest(reset: Partial<passwordReset>, trx?: Knex.Transaction): Promise<passwordReset> {
    const query = trx || db
    const record = await query("password_resets").insert( {
        user_id: reset.userId,
        otp_hash: reset.otpHash,
        expires_at: reset.expiresAt,
        created_at: reset.createdAt,
    }).returning(PASSWORD_RESET_COLUMNS);
    return toEntity(record[0]);
}

export async function getLatestPasswordResetRequestById(userId: number): Promise<passwordReset | undefined> {
    const record = await db.select(PASSWORD_RESET_COLUMNS).from('password_resets').where(
        'user_id', userId
    ).andWhere('consumed_at', null).orderBy('created_at', 'desc').first();

    return record? toEntity(record) : undefined;
}

export async function consumePasswordResetRequest(id: number): Promise<void> {
    await db("password_resets").where('id', id).update({
        consumed_at: new Date()
    });
}