import { createParamDecorator } from '@nestjs/common';
export const CurrentUser = createParamDecorator((_, ctx) => {
    return ctx.switchToHttp().getRequest().user;
});
//# sourceMappingURL=current-user.decorator.js.map