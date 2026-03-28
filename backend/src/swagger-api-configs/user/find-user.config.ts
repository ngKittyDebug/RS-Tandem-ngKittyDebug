import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findUserConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение данных пользователя',
    description: 'Возвращает информацию о текущем авторизованном пользователе.',
  },
  okResponse: {
    description: 'Данные пользователя',
    schema: {
      example: {
        email: 'user@example.com',
        username: 'john_doe',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        role: 'user',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    },
  ],
};
