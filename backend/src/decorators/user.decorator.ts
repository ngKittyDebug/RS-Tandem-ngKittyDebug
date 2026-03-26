import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/modules/interface/jwt-payload';

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export const User = createParamDecorator(
  (data: keyof JwtPayload, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
