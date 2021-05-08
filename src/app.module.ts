import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {UserModule} from './users/user.module';
import {RefreshTokensModule} from './refresh-tokens/refresh-tokens.module';
import {BimCatsModule} from './bim-cats/bim-cats.module';
import {LauncherModule} from './launcher/launcher.module';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {APP_GUARD} from "@nestjs/core";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import * as config from 'config'

@Module({
    imports: [
        MongooseModule.forRoot(config.get('db.mongoDBUri'), {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        }),
        UserModule,
        RefreshTokensModule,
        BimCatsModule,
        LauncherModule,
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 100,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'mk3Public', 'website'),
        }),
        MailModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ],
})
export class AppModule {
}
