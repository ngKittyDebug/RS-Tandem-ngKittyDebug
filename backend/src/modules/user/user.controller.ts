import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { UserDto } from './dto/update-user.dto';
import { UpdateUserPassword } from './dto/update-user-pass.dto';
import { ConfirmPasswordDto } from './dto/delete-user-account.dto';
import { User } from 'src/decorators/user.decorator';
import { AvatarUpdateDto } from './dto/update-avater.dto';

export const ApiAuth = () => applyDecorators(ApiBearerAuth());

@ApiTags('User')
@ApiAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Получение данных пользователя',
    description: 'Возвращает информацию о текущем авторизованном пользователе.',
  })
  @ApiOkResponse({
    description: 'Данные пользователя',
    schema: {
      example: {
        email: 'user@example.com',
        username: 'john_doe',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Get()
  findOne(@User('id') id: string) {
    return this.userService.gtUserProfile(id);
  }

  @ApiOperation({
    summary: 'Обновление профиля',
    description:
      'Обновляет username и/или email текущего пользователя. Требует подтверждения пароля.',
  })
  @ApiBody({ type: UserDto })
  @ApiOkResponse({
    description: 'Профиль успешно обновлён',
    schema: {
      example: {
        email: 'newemail@example.com',
        username: 'new_username',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 403,
    description: 'Неверный пароль',
  })
  @ApiResponse({
    status: 409,
    description: 'Email или username уже занят',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Patch('profile')
  updateUser(@User('id') id: string, @Body() updateUserDto: UserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Обновление аватара',
    description:
      'Обновляет URL аватара текущего пользователя. Требует валидный URL изображения.',
  })
  @ApiBody({ type: AvatarUpdateDto })
  @ApiOkResponse({
    description: 'Аватар успешно обновлён',
    schema: {
      example: {
        avatar: 'https://example.com/avatars/user123.jpg',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный URL аватара',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Patch('avatar')
  updateUserAvatar(
    @User('id') id: string,
    @Body() avatarUpdateDto: AvatarUpdateDto,
  ) {
    return this.userService.updateUserAvatar(id, avatarUpdateDto);
  }

  @ApiOperation({
    summary: 'Смена пароля',
    description: 'Изменяет пароль текущего пользователя.',
  })
  @ApiBody({ type: UpdateUserPassword })
  @ApiOkResponse({
    description: 'Пароль успешно изменён',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 403,
    description: 'Неверный старый пароль',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  updatePassword(
    @User('id') id: string,
    @Body() updateUserPassword: UpdateUserPassword,
  ) {
    return this.userService.updatePassword(id, updateUserPassword);
  }

  @ApiOperation({
    summary: 'Удаление аккаунта',
    description:
      'Безвозвратно удаляет аккаунт текущего пользователя и все связанные данные.',
  })
  @ApiBody({ type: ConfirmPasswordDto })
  @ApiOkResponse({
    description: 'Аккаунт успешно удалён',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 403,
    description: 'Неверный пароль',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Delete()
  delete(
    @User('id') id: string,
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ) {
    return this.userService.deleteUser(id, confirmPasswordDto);
  }
}
