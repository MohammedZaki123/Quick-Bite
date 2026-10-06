"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireInternalApiKey = requireInternalApiKey;
const env_1 = require("../config/env");
function requireInternalApiKey(req, res, next) {
    if (!env_1.env.internal.apiKey) {
        return res.status(500).json({ error: "Internal api key not configured" });
    }
    if (req.headers["api-key"] != env_1.env.internal.apiKey) {
        return res.status(401).json({ error: "Invalid api key" });
    }
    next();
}
