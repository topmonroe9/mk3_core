import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from '@schemas/user.schema';
import {UserService} from './user.service';
import {UserController} from "./user.controller";
import {RefreshToken, RefreshTokenSchema} from "@schemas/refresh-token.schema";
import {RefreshTokensService} from "../refresh-tokens/refresh-tokens.service";
import {MailService} from "../mail/mail.service";
import {MailModule} from "../mail/mail.module";


@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        MongooseModule.forFeature([{name: RefreshToken.name, schema: RefreshTokenSchema}]),
        MailModule,
    ],
    providers: [UserService, RefreshTokensService ],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {
}
