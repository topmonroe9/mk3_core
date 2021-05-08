import {Injectable} from "@nestjs/common";
import * as config from "config";
import * as nodemailer from 'nodemailer'
@Injectable()

export class MailService {

    async sendEmail({ to, subject, html, from: string = process.env.mailFrom }) {

        const transporter = nodemailer.createTransport(config.get('mail.email'))
        // @ts-ignore
        await transporter.sendMail({ from, to, subject, html})
    }

}
