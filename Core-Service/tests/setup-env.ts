import 'reflect-metadata'
import { config } from 'dotenv'
import path = require("node:path");


const result = config({ path: path.resolve(__dirname, '../.env.test') });
if (result.parsed) {
    for (const k in result.parsed) {
        if (!process.env[k]) {
            process.env[k] = result.parsed[k];
        }
    }
}
