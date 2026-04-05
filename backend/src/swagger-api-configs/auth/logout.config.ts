import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const logoutConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Выход из системы',
    description: 'Очищает refresh токен из cookies и завершает сессию.',
  },
  okResponse: {
    description: 'Успешный выход',
    schema: {
      example: {
        logout: true,
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка при выходе из системы',
    },
  ],
  bearerAuth: true,
};
