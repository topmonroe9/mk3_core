import {Module} from '@nestjs/common';
import {LauncherService} from './launcher.service';
import {LauncherController} from './launcher.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Launcher, LauncherSchema} from "@schemas/launcher.schema";
import {UserModule} from "../users/user.module";
import {User, UserSchema} from "@schemas/user.schema";
import {RefreshTokensModule} from "../refresh-tokens/refresh-tokens.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Launcher.name, schema: LauncherSchema}]),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        UserModule,
RefreshTokensModule    ],
    providers: [
        LauncherService,
    ],
    controllers: [LauncherController]
})
export class LauncherModule {
}
