"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationId = correlationId;
const uuid_1 = require("uuid");
function correlationId(req, res, next) {
    req.correlationId = (0, uuid_1.v4)();
    res.setHeader('X-CorrelationId', req.correlationId);
    next();
}
