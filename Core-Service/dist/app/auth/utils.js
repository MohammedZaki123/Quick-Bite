"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.generateOTP = generateOTP;
exports.hashOTP = hashOTP;
exports.compareOTP = compareOTP;
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../lib/config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, 10);
}
// for login
async function comparePassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
function createAccessToken(payload) {
    const options = {
        expiresIn: Number(env_1.env.jwt.accessExpiresIn),
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.accessSecret, options);
}
function createRefreshToken(payload) {
    const options = {
        expiresIn: Number(env_1.env.jwt.refreshExpiresIn),
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.refreshSecret, options);
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
}
function verifyRefreshToken(token) {
    // try {
    //     return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
    // } catch (err) {
    //     throw invalidTokenError;
    // }
    return jsonwebtoken_1.default.verify(token, env_1.env.jwt.refreshSecret);
    // if(!payload){
    //     throw invalidTokenError;
    // }
}
function generateOTP() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
function hashOTP(otp) {
    return crypto_1.default.createHash('sha256').update(otp).digest('hex');
}
function compareOTP(otp, hash) {
    const otpHash = hashOTP(otp);
    return otpHash === hash;
}
