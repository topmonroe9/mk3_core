import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { BimCatsModule } from './bim-cats/bim-cats.module';
import { LauncherModule } from './launcher/launcher.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { PluginsModule } from './plugins/plugins.module';
import * as config from 'config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppLoggerMiddleware } from './middleware/logger.middleware';

const errorFileFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${level}: ${timestamp} ${message}`;
});
const loggerFileFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${level}: ${message}`;
});


@Module({
    imports: [
        MongooseModule.forRoot(config.get('db.mongoDBUri'), {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true,
        }),
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 100,
        }),
        WinstonModule.forRoot({
            transports: [
                new winston.transports.DailyRotateFile({
                    level: 'info',
                    filename: './logs/server.log',
                    format: loggerFileFormat,
                }),
            ],
            // @ts-ignore
            rejectionHandlers: [
                new winston.transports.File({ filename: './logs/error.log', format: errorFileFormat })
            ],
            exceptionHandlers: [
                new winston.transports.File({ filename: './logs/error.log', format: errorFileFormat })
            ],
        }),
        UserModule,
        RefreshTokensModule,
        BimCatsModule,
        LauncherModule,
        MailModule,
        PluginsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule{
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AppLoggerMiddleware).forRoutes('*');
    }
}
