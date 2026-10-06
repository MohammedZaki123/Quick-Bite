"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const config = {
    client: 'pg',
    connection: {
        host: env_1.env.db.host,
        port: env_1.env.db.port,
        user: env_1.env.db.username,
        password: env_1.env.db.password,
        database: env_1.env.db.name,
    },
    pool: {
        max: env_1.env.db.poolMax,
    },
    migrations: {
        directory: env_1.env.db.migrationDirectory,
        extension: env_1.env.db.migrationExtension,
    }
};
exports.default = config;
