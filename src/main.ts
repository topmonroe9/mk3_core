import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as config from 'config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    const origin: string = config.get('server.origin');
    const port: string = config.get('server.port');

    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                'default-src': [`${origin}`],
                'base-uri': ["'self'"],
                'font-src': ["'self'", 'https:', 'data:'],
                'frame-ancestors': ['self'],
                'img-src': ["'self'", 'data:'],
                'object-src': "'none'",
                'script-src': ["'self'", "'unsafe-eval'"],
                'script-src-attr': ['none'],
                'style-src': ["'self'", 'https:', "'unsafe-inline'"],
            },
        }),
    );
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());

    app.enableCors({
        origin: origin,
        credentials: true,
    });

    app.use(compression());
    // app.use(csurf({
    //   cookie: true
    // }))

    await app.listen(port);

    console.log(
        `\n\n\x1b[32m Server started listentning on port \x1b[33m${port}. \n\n\x1b[0m`,
    );
}
bootstrap();
