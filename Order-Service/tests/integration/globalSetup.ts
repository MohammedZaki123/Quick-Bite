import {config} from 'dotenv';
import path from 'path';

const result = config({path: path.resolve(__dirname, '../../.env.test')});
if (result.parsed) {
    for (const k in result.parsed) {
        if (!process.env[k]) {
            process.env[k] = result.parsed[k];
        }
    }
}

export default async function globalSetup() {
    try {
        // Set default region for migrations
        process.env.REGION = 'eg';
        const {db} = require('../../src/lib/knex/knex');
        const conn = db('eg');
        await conn.migrate.latest();
        console.log("Database migrations completed successfully for region 'eg'.");
    } catch(e) {
        console.error("Migration in globalSetup failed:", e);
        throw e;
    }
}
