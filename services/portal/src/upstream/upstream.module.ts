import { Global, Module } from '@nestjs/common';
import { UpstreamClient } from './upstream.client.js';

@Global()
@Module({ providers: [UpstreamClient], exports: [UpstreamClient] })
export class UpstreamModule {}
