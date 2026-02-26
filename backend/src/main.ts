import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const logger = new Logger();

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableCors({
    origin: '*',
    credentials: true,
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
  });

  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<number>('HOST');

  await app.listen(port);
  logger.log(`App start: ${host}:${port}`);
  logger.log(`Swagger start: ${host}:${port}/docs`);
}
void bootstrap();
