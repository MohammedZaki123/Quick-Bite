"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const errors_1 = require("./errors");
const utils_1 = require("../../app/auth/utils");
function authenticate(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        throw errors_1.NotAuthenticated;
    }
    req.user = (0, utils_1.verifyAccessToken)(token);
    next();
}
