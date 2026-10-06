import {MailjetConfig, MailjetEmailProvider} from "../../pkg/email/mailjet";
import {env} from "../config/env";

const config: MailjetConfig = {
    apiKey: env.mailjet.apiKey,
    secretKey: env.mailjet.secretKey,
    fromEmail: env.mailjet.fromEmail,
    fromName: env.mailjet.fromName,
}
export const emailProvider = new MailjetEmailProvider(config);