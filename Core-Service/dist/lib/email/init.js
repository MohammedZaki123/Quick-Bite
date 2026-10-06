"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProvider = void 0;
const mailjet_1 = require("../../pkg/email/mailjet");
const env_1 = require("../config/env");
const config = {
    apiKey: env_1.env.mailjet.apiKey,
    secretKey: env_1.env.mailjet.secretKey,
    fromEmail: env_1.env.mailjet.fromEmail,
    fromName: env_1.env.mailjet.fromName,
};
exports.emailProvider = new mailjet_1.MailjetEmailProvider(config);
