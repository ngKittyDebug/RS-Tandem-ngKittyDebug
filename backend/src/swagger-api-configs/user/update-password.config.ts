import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UpdateUserPassword } from '../../modules/user/dto/update-user-pass.dto';

export const updatePasswordConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Смена пароля',
    description: 'Изменяет пароль текущего пользователя.',
  },
  body: { type: UpdateUserPassword },
  okResponse: {
    description: 'Пароль успешно изменён',
    schema: {
      example: {
        success: true,
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
      description: 'Неверный старый пароль',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
  ],
};
