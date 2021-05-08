import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {UserDto} from "../users/dto/UserDto";
import * as config from "config";
import {UserDocument} from "@schemas/user.schema";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
    }

    domain = 'http://crm.mk3.ru/'

    async sendVerificationEmail(user: UserDocument) {
        const verifyUrl = `${this.domain}#/account/verify-email?token=${user.verificationToken}`

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Регистрация',
            template: './templates/confirmation.hbs',
            context: {
                firstName: user.firstName,
                verifyUrl
            }
        });
        return
    }
}
