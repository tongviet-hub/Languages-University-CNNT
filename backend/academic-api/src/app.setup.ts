import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { requestIdMiddleware } from './common/request-id.middleware.js';
import { parseTrustProxy } from './common/trust-proxy.js';

/** Cấu hình chung cho app thật (main.ts) và app trong e2e test, để hai bên luôn hành xử giống nhau. */
export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService);

  // Academic nằm sau Portal. Chỉ tin X-Forwarded-For từ đúng IP của Portal (TRUST_PROXY) để rate limit
  // tính theo IP người dùng thật; không tin cả dải mạng riêng, vì như vậy ai gọi thẳng vào cũng giả được IP.
  app.set('trust proxy', parseTrustProxy(config.get<string>('TRUST_PROXY')));

  app.use(requestIdMiddleware);
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // bỏ field thừa
      forbidNonWhitelisted: true, // ...và báo lỗi nếu client gửi field lạ (vd: tự gửi "role" khi đăng ký)
      transform: true, // ép kiểu query/param theo DTO
    }),
  );

  if (config.get('NODE_ENV') !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('School Portal API')
      .setDescription('Xác thực & phân quyền')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }
}
