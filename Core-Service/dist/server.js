"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = __importDefault(require("http"));
const app_js_1 = require("./app.js");
const env_js_1 = require("./lib/config/env.js");
const knex_js_1 = require("./lib/knex/knex.js");
const logger_js_1 = require("./lib/logger/logger.js");
const app = (0, app_js_1.createApp)();
const server = http_1.default.createServer(app);
server.listen(env_js_1.env.port, () => {
    console.log(`Server is running on port ${env_js_1.env.port}`);
});
async function shutdown() {
    logger_js_1.logger.info("shutdown requested");
    server.close(async () => {
        try {
            await knex_js_1.db.destroy();
        }
        catch { }
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
