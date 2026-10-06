"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        ALTER TABLE restaurant_branches
        ADD COLUMN delivery_fee INT NOT NULL DEFAULT 0;
    `);
}
async function down(knex) {
    await knex.raw(`ALTER TABLE restaurant_branches DROP COLUMN delivery_fee;`);
}
