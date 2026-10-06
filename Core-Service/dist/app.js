"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const correlationID_1 = require("./lib/correlationID/correlationID");
const errorHandler_1 = require("./lib/error/errorHandler");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./lib/config/env");
const helmet_1 = __importDefault(require("helmet"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: env_1.env.cors.origins, credentials: true }));
    app.set('query parser', 'extended');
    // app.use(express.json({
    //     verify: (req, _res, buf) => {
    //         (req as any).rawBody = buf;
    //     }
    // }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(correlationID_1.correlationId);
    app.use('/api', routes_1.routes);
    app.use(errorHandler_1.errorHandler);
    return app;
}
