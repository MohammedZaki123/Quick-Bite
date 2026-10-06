"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = setAuthCookies;
const env_1 = require("../config/env");
const time_1 = require("../../pkg/utils/time");
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env_1.env.isProduction,
        maxAge: (0, time_1.toMs)(1, 'h'),
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env_1.env.isProduction,
        maxAge: (0, time_1.toMs)(7, 'd'),
        path: '/api/auth/refresh',
    });
}
