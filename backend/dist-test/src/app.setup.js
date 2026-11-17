import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
export function configureApp(app) {
    const config = app.get(ConfigService);
    app.use(helmet());
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: (config.get('CORS_ORIGINS') ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    if (config.get('NODE_ENV') !== 'production') {
        const doc = new DocumentBuilder()
            .setTitle('School Portal API')
            .setDescription('Xác thực & phân quyền')
            .addBearerAuth()
            .build();
        SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
    }
}
//# sourceMappingURL=app.setup.js.map