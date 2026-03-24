import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UserDto } from '../../modules/user/dto/update-user.dto';

export const updateUserConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Обновление профиля',
    description:
      'Обновляет username и/или email текущего пользователя. Требует подтверждения пароля.',
  },
  body: { type: UserDto },
  okResponse: {
    description: 'Профиль успешно обновлён',
    schema: {
      example: {
        email: 'newemail@example.com',
        username: 'new_username',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректные данные',
    },
    {
      status: HttpStatus.FORBIDDEN,
      description: 'Неверный пароль',
    },
    {
      status: HttpStatus.CONFLICT,
      description: 'Email или username уже занят',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
  ],
};
