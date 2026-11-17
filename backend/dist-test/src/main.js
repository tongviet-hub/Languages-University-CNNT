import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    const port = app.get(ConfigService).getOrThrow('PORT');
    await app.listen(port);
    new Logger('Bootstrap').log(`API chạy tại http://localhost:${port}/api  |  Swagger: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map