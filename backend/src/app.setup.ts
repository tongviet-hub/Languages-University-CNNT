import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

/** Cấu hình chung cho app thật (main.ts) và app trong e2e test, để hai bên luôn hành xử giống nhau. */
export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix('api');
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
