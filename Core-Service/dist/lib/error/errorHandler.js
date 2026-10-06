"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../logger/logger");
function errorHandler(err, req, res, _next) {
    const operational = err.isOperational;
    logger_1.logger.error(err.message, {
        statusCode: err.statusCode,
        stack: err.stack,
        operational: operational,
        body: req.body,
        correlationId: req.correlationId
    });
    if (operational) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    return res.status(500).json({
        error: 'Something went wrong',
    });
}
