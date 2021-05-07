import { Module } from '@nestjs/common';
import { BimCatsService } from './bim-cats.service';
import { BimCatsController } from './bim-cats.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "@schemas/user.schema";
import {BimCat, BimCatSchema} from "@schemas/bimCategory.schema";
import {UserService} from "../users/user.service";
import {RefreshToken, RefreshTokenSchema} from "@schemas/refresh-token.schema";
import {MailService} from "../_sevices/mailer";
import {RefreshTokensService} from "../refresh-tokens/refresh-tokens.service";

@Module({
  imports: [
      MongooseModule.forFeature([{name: BimCat.name, schema: BimCatSchema}]),
      MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
      MongooseModule.forFeature([{name: RefreshToken.name, schema: RefreshTokenSchema}])
  ],
  providers: [
      BimCatsService,
      UserService,
      MailService,
      RefreshTokensService,
     ],
  controllers: [BimCatsController]
})
export class BimCatsModule {}
