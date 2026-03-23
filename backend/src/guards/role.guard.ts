import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ImATeapotException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/role.decorator';
import { RequestWithUser } from 'src/decorators/user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ImATeapotException();
    }

    if (user.role === roles) {
      return true;
    } else throw new ForbiddenException();
  }
}
