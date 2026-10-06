"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const knex_1 = require("../../lib/knex/knex");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get('/', async (req, res) => {
    try {
        await (0, knex_1.pingDB)();
        res.status(200).send('OK');
    }
    catch (error) {
        res.status(500).json({ message: 'DB down' });
    }
});
