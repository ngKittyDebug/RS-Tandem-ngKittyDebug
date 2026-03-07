import { Body, Controller, Delete, Get, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { Request } from 'express';
import { UserDto } from './dto/update-user.dto';
import { UpdateUserPassword } from './dto/update-user-pass';

export const ApiAuth = () => applyDecorators(ApiBearerAuth());

@ApiAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findOne(@Req() req: Request) {
    return this.userService.findOne(req);
  }

  @Patch('profile')
  updateUser(@Req() req: Request, @Body() updateUserDto: UserDto) {
    return this.userService.updateUser(req, updateUserDto);
  }

  @Patch('password')
  updatePassword(
    @Req() req: Request,
    @Body() updateUserPassword: UpdateUserPassword,
  ) {
    return this.userService.updatePassword(req, updateUserPassword);
  }

  @Delete()
  delete(@Req() req: Request, @Body() updateUserDto: UserDto) {
    return this.userService.deleteUser(req, updateUserDto);
  }
}
