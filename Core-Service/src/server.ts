import "reflect-metadata"
import http from 'http';
import {createApp} from "./app.js";
import {env} from "./lib/config/env.js";
import {db} from "./lib/knex/knex.js";
import {logger} from "./lib/logger/logger.js";
const app = createApp();
const server = http.createServer(app);

server.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
});

async function shutdown() {
   logger.info("shutdown requested");
    server.close(async () => {
        try {
            await db.destroy();
        } catch {}
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

