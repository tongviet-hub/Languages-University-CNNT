import 'reflect-metadata';
import { Controller, Get, Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// Khung tối thiểu: chỉ có /health để đưa vào docker compose và để Portal có địa chỉ để trỏ tới.
// Giai đoạn sau: GET /students/:id/tuitions, POST /tuitions/:id/payments (Idempotency-Key), DB riêng.
@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'finance-api' };
  }
}

@Module({ controllers: [HealthController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // Kiểm tra như Portal/Academic: PORT sai thì dừng ngay, không lặng lẽ nghe cổng ngẫu nhiên (PORT='' -> 0).
  const raw = process.env.PORT?.trim() || '8082';
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT không hợp lệ: "${raw}" (cần số nguyên 1-65535)`);
  }
  await app.listen(port);
  new Logger('Bootstrap').log(`Finance API chạy tại http://localhost:${port}/api/v1`);
}

bootstrap();
