import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { ConfirmPasswordDto } from '../../modules/user/dto/delete-user-account.dto';

export const deleteUserConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Удаление аккаунта',
    description:
      'Безвозвратно удаляет аккаунт текущего пользователя и все связанные данные.',
  },
  body: { type: ConfirmPasswordDto },
  okResponse: {
    description: 'Аккаунт успешно удалён',
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
      description: 'Неверный пароль',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
  ],
};
