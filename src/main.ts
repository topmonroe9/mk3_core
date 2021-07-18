import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as config from 'config';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    // const origin: string = config.get('server.origin');
    const port: string = config.get('server.port');

    // let httpsOptions;
    // if (process.env.NODE_ENV === 'production') {
    //     httpsOptions = {
    //         key: fs.readFileSync(path.join(__dirname, 'secrets', 'key.pem'), 'utf8'),
    //         cert: fs.readFileSync(path.join(__dirname, 'secrets', 'crm_mk3_ru_2022_05_14.pem'), 'utf8'),
    //         ca: [fs.readFileSync(path.join(__dirname, 'secrets', 'intermediate_pem_thawte_ssl123_1.pem'), 'utf8')],
    //     };
    // }

    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    //
    // app.use(
    //     helmet.contentSecurityPolicy({
    //         directives: {
    //             'default-src': [`${origin}`],
    //             'base-uri': ["'self'"],
    //             'font-src': ["'self'", 'https:', 'data:'],
    //             'frame-ancestors': ['self'],
    //             'img-src': ["'self'", 'data:'],
    //             'object-src': "'none'",
    //             'script-src': ["'self'", "'unsafe-eval'"],
    //             'script-src-attr': ['none'],
    //             'style-src': ["'self'", 'https:', "'unsafe-inline'"],
    //         },
    //     })
    // );
    // app.use(helmet.dnsPrefetchControl());
    // app.use(helmet.expectCt());
    // app.use(helmet.frameguard());
    // app.use(helmet.hidePoweredBy());
    // app.use(helmet.hsts());
    // app.use(helmet.ieNoOpen());
    // app.use(helmet.noSniff());
    // app.use(helmet.permittedCrossDomainPolicies());
    // app.use(helmet.referrerPolicy());
    // app.use(helmet.xssFilter());
    //
    // app.enableCors({
    //     origin: origin,
    //     credentials: true,
    // });

    await app.listen(`${port}`);
    console.log(`\n\n\x1b[32m Server started listentning on port \x1b[33m${port}. \n\n\x1b[0m`);
}
bootstrap();
