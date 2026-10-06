import { IEmailProvider } from "./email.interface";
export interface MailjetConfig {
    apiKey: string;
    secretKey: string;
    fromEmail: string;
    fromName: string;
}
export declare class MailjetEmailProvider implements IEmailProvider {
    private mailjetClient;
    private fromEmail;
    private fromName;
    constructor(config: MailjetConfig);
    send(to: string, subject: string, html: string): Promise<void>;
}
