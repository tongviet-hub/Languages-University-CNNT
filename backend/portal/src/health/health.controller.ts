import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/** Portal không có DB; /health chỉ cho biết chính nó còn sống (không phụ thuộc dịch vụ con, để Portal vẫn "sống" khi chúng chết). */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'portal' };
  }
}
