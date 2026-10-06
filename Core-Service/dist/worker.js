"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const croner_1 = require("croner");
const env_1 = require("./lib/config/env");
const logger_1 = require("./lib/logger/logger");
const knex_1 = require("./lib/knex/knex");
const init_1 = require("./lib/events/init");
const outbox_drain_1 = require("./lib/events/outbox-drain");
/**
 * Outbox worker — runs independently of the HTTP server.
 *
 * API instances write to `events_outbox` in the same trx as their domain
 * mutation. This worker process polls that table on a schedule and publishes
 * pending rows to RabbitMQ with publisher confirms. Scales horizontally: the
 * repository's `claimBatch` uses FOR UPDATE SKIP LOCKED so N workers can run
 * in parallel without duplicate publishes.
 */
async function main() {
    try {
        await init_1.messageBroker.connect();
        await init_1.messageBroker.declareExchange(env_1.env.rabbit.exchange);
        logger_1.logger.info("worker: broker connected, exchange declared", { exchange: env_1.env.rabbit.exchange });
    }
    catch (err) {
        logger_1.logger.warn("worker: broker not reachable at boot — will retry on every drain", {
            error: err?.message ?? String(err),
        });
    }
    const pattern = env_1.env.rabbit.drainCron;
    const job = new croner_1.Cron(pattern, { protect: true }, async () => {
        try {
            await (0, outbox_drain_1.drainOutbox)();
        }
        catch (err) {
            logger_1.logger.error("outbox drain error", { error: err.message });
        }
    });
    logger_1.logger.info("worker: outbox drain scheduled", { pattern, batchSize: env_1.env.rabbit.batchSize });
    const shutdown = async () => {
        logger_1.logger.info("worker: shutdown requested");
        job.stop();
        try {
            await init_1.messageBroker.close();
        }
        catch (err) {
            logger_1.logger.warn("worker: broker close error", { error: err.message });
        }
        try {
            await knex_1.db.destroy();
        }
        catch { }
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
main().catch((err) => {
    logger_1.logger.error("worker: fatal", { error: err.message, stack: err.stack });
    process.exit(1);
});
