import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { Request } from 'express';

export const ApiAuth = () => applyDecorators(ApiBearerAuth());

@ApiAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  findOne(@Req() req: Request) {
    return req.user;
  }
}
