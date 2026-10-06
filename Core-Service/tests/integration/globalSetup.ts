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
    try{
        const {db} = require('../../src/lib/knex/knex');
        await db.migrate.latest();
    }catch(e){
        console.error(e);
    }
}