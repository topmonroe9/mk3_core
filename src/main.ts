import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet'
import * as compression from 'compression';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use( cookieParser() );

  /*
   * Helmet configuration
   */
  app.use(helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["http://crm.mk3.ru"],
      "base-uri": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
      "frame-ancestors": ['self'],
      "img-src": ["'self'", "data:"],
      "object-src": "'none'",
      "script-src": ["'self'", "'unsafe-eval'"],
      "script-src-attr": ['none'],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
    },
  }));
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

  const origin = process.env.origin
  const port = process.env.port

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true
  })

  app.use(compression());
  // app.use(csurf({
  //   cookie: true
  // }))

  await app.listen(3000);

}
bootstrap();
