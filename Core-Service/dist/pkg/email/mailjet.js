"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailjetEmailProvider = void 0;
const node_mailjet_1 = __importDefault(require("node-mailjet"));
class MailjetEmailProvider {
    mailjetClient;
    fromEmail;
    fromName;
    constructor(config) {
        // Initialize Mailjet client with API key and secret key
        this.mailjetClient = new node_mailjet_1.default({
            apiKey: config.apiKey,
            apiSecret: config.secretKey,
        });
        this.fromEmail = config.fromEmail;
        this.fromName = config.fromName;
    }
    async send(to, subject, html) {
        // Implement the logic to send an email using Mailjet API
        await this.mailjetClient.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: this.fromEmail,
                        Name: this.fromName
                    },
                    To: [
                        {
                            Email: to,
                        }
                    ],
                    Subject: subject,
                    HTMLPart: html
                }
            ]
        });
    }
}
exports.MailjetEmailProvider = MailjetEmailProvider;
