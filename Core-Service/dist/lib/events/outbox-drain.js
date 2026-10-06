"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drainOutbox = drainOutbox;
const knex_1 = require("../knex/knex");
const env_1 = require("../config/env");
const logger_1 = require("../logger/logger");
const init_1 = require("./init");
const outbox_repo_1 = require("./outbox.repo");
/**
 * One pass over the outbox: claim a batch with FOR UPDATE SKIP LOCKED, publish
 * each row to the core.events exchange with publisher confirms, mark dispatched.
 * A publish failure marks the row as failed, bumps attempts, and bails out of
 * the batch (the broker is probably sick — don't hold the lock on the rest).
 *
 * Call site is the worker's scheduler (Croner). This function is idempotent
 * with respect to itself thanks to SKIP LOCKED, so running more than one worker
 * in parallel is safe.
 */
async function drainOutbox() {
    await init_1.messageBroker.connect().catch(() => { });
    const trx = await knex_1.db.transaction();
    try {
        const rows = await (0, outbox_repo_1.claimBatch)(trx, env_1.env.rabbit.batchSize);
        if (rows.length === 0) {
            await trx.commit();
            return;
        }
        for (const row of rows) {
            const envelope = {
                eventId: row.event_id,
                eventType: row.event_type,
                occurredAt: new Date().toISOString(),
                aggregateType: row.aggregate_type,
                aggregateId: row.aggregate_id,
                payload: row.payload,
            };
            try {
                await init_1.messageBroker.publishConfirmed(env_1.env.rabbit.exchange, row.event_type, Buffer.from(JSON.stringify(envelope), "utf8"));
                await (0, outbox_repo_1.markDispatched)(trx, row.id);
            }
            catch (err) {
                const msg = describeError(err);
                await (0, outbox_repo_1.markFailed)(trx, row.id, msg);
                logger_1.logger.error("outbox publish failed", { id: row.id, error: msg });
                break;
            }
        }
        // bulk update for dispatched and bulk update for failed
        await trx.commit();
    }
    catch (err) {
        await trx.rollback();
        throw err;
    }
}
function describeError(err) {
    if (err instanceof Error && err.message)
        return err.message;
    if (err && typeof err === "object" && "errors" in err) {
        const inner = err.errors;
        if (Array.isArray(inner) && inner.length > 0) {
            return inner.map(describeError).filter(Boolean).join("; ");
        }
    }
    try {
        return JSON.stringify(err);
    }
    catch {
        return String(err);
    }
}
