"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            system_role TEXT NOT NULL CHECK (system_role IN ('system_admin', 'customer', 'restaurant_user', 'delivery_agent')),
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            deleted_at TIMESTAMP
         );
         CREATE INDEX idx_users_email ON users(email);
         CREATE INDEX idx_users_system_role ON users(system_role);
`);
}
async function down(knex) {
    await knex.raw(`DROP TABLE IF EXISTS users;`);
}
