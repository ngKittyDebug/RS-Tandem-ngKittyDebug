import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import { UserService } from './user.service';
import { UserDto } from './dto/update-user.dto';
import { UpdateUserPassword } from './dto/update-user-pass.dto';
import { ConfirmPasswordDto } from './dto/delete-user-account.dto';
import { User } from 'src/decorators/user.decorator';
import { AvatarUpdateDto } from './dto/update-avatar.dto';
import {
  findUserConfig,
  updateUserConfig,
  updateUserAvatarConfig,
  updatePasswordConfig,
  deleteUserConfig,
} from 'src/swagger-api-configs/user';

@ApiTags('User')
@ApiAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiSwagger(findUserConfig)
  @Get()
  findOne(@User('id') id: string) {
    return this.userService.gtUserProfile(id);
  }

  @ApiSwagger(updateUserConfig)
  @Patch('profile')
  updateUser(@User('id') id: string, @Body() updateUserDto: UserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiSwagger(updateUserAvatarConfig)
  @Patch('avatar')
  updateUserAvatar(
    @User('id') id: string,
    @Body() avatarUpdateDto: AvatarUpdateDto,
  ) {
    return this.userService.updateUserAvatar(id, avatarUpdateDto);
  }

  @ApiSwagger(updatePasswordConfig)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  updatePassword(
    @User('id') id: string,
    @Body() updateUserPassword: UpdateUserPassword,
  ) {
    return this.userService.updatePassword(id, updateUserPassword);
  }

  @ApiSwagger(deleteUserConfig)
  @Delete()
  delete(
    @User('id') id: string,
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ) {
    return this.userService.deleteUser(id, confirmPasswordDto);
  }
}
