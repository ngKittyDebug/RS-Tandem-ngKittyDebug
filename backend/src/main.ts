import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from './guards/auth.guard';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = app.get(ConfigService);

  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const logger = new Logger(bootstrap.name);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const corsPattern = new RegExp(config.getOrThrow<string>('DEPLOY_URL_CORS'));

  app.enableCors({
    origin: [`${config.getOrThrow<string>('DEV_HOST')}`, corsPattern],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'MeowVault API Docs',
    yamlDocumentUrl: '/openapi.yaml',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tags: ['Auth', 'User'],
    },
  });

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<number>('DEV_HOST');
  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');
  logger.log(`App start: ${host}`);
  logger.log(`Swagger start: ${host}/docs`);
}
void bootstrap();
