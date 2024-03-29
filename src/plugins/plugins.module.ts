import { Module } from '@nestjs/common';
import { PluginsController } from './plugins.controller';
import { PluginsService } from './plugins.service';
import {UserModule} from "../users/user.module";
import {RefreshTokensModule} from "../refresh-tokens/refresh-tokens.module";
import {MongooseModule} from "@nestjs/mongoose";
import {Launcher, LauncherSchema} from "@schemas/launcher.schema";
import {User, UserSchema} from "@schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Launcher.name, schema: LauncherSchema}]),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    UserModule,
    RefreshTokensModule
  ],
  controllers: [PluginsController],
  providers: [PluginsService]
})
export class PluginsModule {}
