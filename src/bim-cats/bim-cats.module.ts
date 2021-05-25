import { Module } from '@nestjs/common';
import { BimCatsService } from './bim-cats.service';
import { BimCatsController } from './bim-cats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@schemas/user.schema';
import { BimCat, BimCatSchema } from '@schemas/bimCategory.schema';
import {
    RefreshToken,
    RefreshTokenSchema,
} from '@schemas/refresh-token.schema';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { UserModule } from '../users/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BimCat.name, schema: BimCatSchema },
        ]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: RefreshToken.name, schema: RefreshTokenSchema },
        ]),
        UserModule,
        MailModule,
    ],
    providers: [BimCatsService, RefreshTokensService],
    controllers: [BimCatsController],
    exports: [BimCatsService],
})
export class BimCatsModule {}
