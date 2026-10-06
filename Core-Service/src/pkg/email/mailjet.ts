import {IEmailProvider} from "./email.interface";
import Mailjet from "node-mailjet";

export interface MailjetConfig {
    apiKey: string;
    secretKey: string;
    fromEmail: string;
    fromName: string;
}

export class MailjetEmailProvider implements IEmailProvider {
    private mailjetClient: Mailjet;
    private fromEmail: string;
    private fromName: string;
    constructor(config: MailjetConfig) {
            // Initialize Mailjet client with API key and secret key
        this.mailjetClient = new Mailjet({
            apiKey: config.apiKey,
            apiSecret: config.secretKey,
        });
        this.fromEmail = config.fromEmail;
        this.fromName = config.fromName;
    }
    async send(to: string, subject: string, html: string): Promise<void> {
        // Implement the logic to send an email using Mailjet API
      await this.mailjetClient.post("send", { version: "v3.1" }).request({
                Messages:[
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
        }]
    })
    }
}
