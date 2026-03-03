import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = app.get(ConfigService);
  const logger = new Logger(bootstrap.name);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableCors({
    origin: [
      `${config.getOrThrow<string>('DEV_HOST')}`,
      `${config.getOrThrow<string>('DEPLOY_URL_CORS')}`,
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MeowVault')
    .setDescription(
      'MeowVault — это уютный учебный каталог с несколькими играми, которые помогают прокачать знания JavaScript, TypeScript',
    )
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    yamlDocumentUrl: '/openapi.yaml',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<number>('DEV_HOST');

  await app.listen(port, '0.0.0.0');
  logger.log(`App start: ${host}`);
  logger.log(`Swagger start: ${host}/docs`);
}
void bootstrap();
