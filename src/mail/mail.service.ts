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

    async sendWelcomeEmail(user: UserDocument) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Добро пожаловать!',
            template: './templates/welcome.hbs',
            context: {
                firstName: user.firstName,
            }
        });
        return
    }


    async sendPasswordResetEmail(user: UserDocument) {
        const resetUrl = `${this.domain}#/account/reset-password?token=${user.resetToken.token}`
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Восстановление пароля',
            template: './templates/passwordReset.hbs',
            context: {
                firstName: user.firstName,
                resetUrl
            }
        });
        return
    }

    async notifyBimCatOpened(user: UserDocument) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Открыт доступ к плагину',
            template: './templates/notifyBimCatOpened.hbs',
            context: {
                firstName: user.firstName,
            }
        });
        return
    }
}
