var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { User } from './users/user.entity.js';
import { UsersModule } from './users/users.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
            TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.getOrThrow('DB_HOST'),
                    port: config.getOrThrow('DB_PORT'),
                    username: config.getOrThrow('DB_USER'),
                    password: config.getOrThrow('DB_PASSWORD'),
                    database: config.getOrThrow('DB_NAME'),
                    entities: [User],
                    synchronize: config.get('DB_SYNCHRONIZE') === 'true' && config.get('NODE_ENV') !== 'production',
                }),
            }),
            ThrottlerModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (config) => ({
                    throttlers: [{ ttl: 60_000, limit: 60 }],
                    skipIf: () => config.get('NODE_ENV') === 'test',
                }),
            }),
            UsersModule,
            AuthModule,
        ],
        controllers: [HealthController],
        providers: [
            { provide: APP_GUARD, useClass: ThrottlerGuard },
            { provide: APP_GUARD, useClass: JwtAuthGuard },
            { provide: APP_GUARD, useClass: RolesGuard },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map