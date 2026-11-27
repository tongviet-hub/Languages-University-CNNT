import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PortalAuthController } from './auth/portal-auth.controller.js';
import { PortalAuthGuard } from './auth/portal-auth.guard.js';
import { ErrorFilter } from './common/error.filter.js';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { UpstreamModule } from './upstream/upstream.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Mặc định 60 request/phút/IP; route đăng nhập siết chặt hơn bằng @Throttle(). Tắt trong e2e test.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: 60_000, limit: 60 }],
        skipIf: () => config.get('NODE_ENV') === 'test',
      }),
    }),
    UpstreamModule,
  ],
  controllers: [HealthController, PortalAuthController],
  providers: [
    PortalAuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: ErrorFilter },
  ],
})
export class AppModule {}
