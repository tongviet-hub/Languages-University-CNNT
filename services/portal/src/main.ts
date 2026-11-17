import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.listen(port);
  new Logger('Bootstrap').log(`Portal chạy tại http://localhost:${port}/api/v1  |  Swagger: http://localhost:${port}/docs`);
}

bootstrap();
