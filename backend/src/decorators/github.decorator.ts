import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Profile } from 'passport-github2';

interface GithubRequest extends Request {
  user?: Profile;
}

export const Github = createParamDecorator(
  (data: keyof Profile, ctx: ExecutionContext) => {
    const request: GithubRequest = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
