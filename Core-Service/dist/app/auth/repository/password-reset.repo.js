"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordResetRequest = createPasswordResetRequest;
exports.getLatestPasswordResetRequestById = getLatestPasswordResetRequestById;
exports.consumePasswordResetRequest = consumePasswordResetRequest;
const password_reset_entity_1 = require("../entity/password_reset.entity");
const knex_1 = require("../../../lib/knex/knex");
function toEntity(record) {
    return new password_reset_entity_1.passwordReset({
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
];
async function createPasswordResetRequest(reset, trx) {
    const query = trx || knex_1.db;
    const record = await query("password_resets").insert({
        user_id: reset.userId,
        otp_hash: reset.otpHash,
        expires_at: reset.expiresAt,
        created_at: reset.createdAt,
    }).returning(PASSWORD_RESET_COLUMNS);
    return toEntity(record[0]);
}
async function getLatestPasswordResetRequestById(userId) {
    const record = await knex_1.db.select(PASSWORD_RESET_COLUMNS).from('password_resets').where('user_id', userId).andWhere('consumed_at', null).orderBy('created_at', 'desc').first();
    return record ? toEntity(record) : undefined;
}
async function consumePasswordResetRequest(id) {
    await (0, knex_1.db)("password_resets").where('id', id).update({
        consumed_at: new Date()
    });
}
