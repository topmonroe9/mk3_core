import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailerModule} from "@nestjs-modules/mailer";
import * as config from "config";
import {join} from 'path';
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Module({
    imports: [
        MailerModule.forRoot({
            transport: config.get('mail.email'),
            defaults: {
                from: `"No Reply" <noreply@mk3.ru>`
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                }
            }
        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {

}
