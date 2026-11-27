import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { requestIdMiddleware } from './common/request-id.middleware.js';
import { parseTrustProxy } from './common/trust-proxy.js';

/** Cấu hình chung cho app thật (main.ts) và app trong e2e test, để hai bên luôn hành xử giống nhau. */
export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService);

  // Mặc định không tin X-Forwarded-For. Chỉ khi có Nginx đứng trước mới đặt TRUST_PROXY = đúng IP của Nginx.
  app.set('trust proxy', parseTrustProxy(config.get<string>('TRUST_PROXY')));

  app.use(requestIdMiddleware);
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
    exposedHeaders: ['X-Request-ID'],
  });

  if (config.get('NODE_ENV') !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('School Portal - Portal API')
      .setDescription('Điểm vào duy nhất, điều phối các dịch vụ phía sau')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }
}
