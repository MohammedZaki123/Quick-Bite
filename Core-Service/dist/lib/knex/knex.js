"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.pingDB = pingDB;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("./knexfile"));
exports.db = (0, knex_1.default)(knexfile_1.default);
async function pingDB() {
    await exports.db.raw('SELECT 1');
}
// export async function down(knex: Knex): Promise<void> {
// return knex.schema.dropTable('users');
// }
