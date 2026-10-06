"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
    CREATE TABLE restaurants (
        id BIGSERIAL PRIMARY KEY,
        owner_id BIGINT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'disabled', 'pending')) DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        logo_url TEXT NOT NULL,
        primary_country TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        status_updated_at TIMESTAMP NOT NULL,
        
        constraint fk_restaurant_owner_id FOREIGN KEY (owner_id) REFERENCES users(id)
    );
    CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
    CREATE INDEX idx_restaurants_status ON restaurants(status);
    CREATE INDEX idx_restaurants_primary_country ON restaurants(primary_country);
    CREATE INDEX idx_restaurants_created_at ON restaurants(created_at);
    `);
}
async function down(knex) {
    await knex.raw(`DROP TABLE IF EXISTS restaurants;`);
}
