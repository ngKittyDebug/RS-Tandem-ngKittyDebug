import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const getAllUserGamesStatsConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение всей статистики пользователя по всем играм',
    description:
      'Возвращает полную статистику пользователя по всем доступным играм.',
  },
  okResponse: {
    description: 'Статистика успешно получена',
    schema: {
      example: [
        {
          gameType: 'mergeGame',
          playedCount: 10,
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        {
          gameType: 'decrypto',
          playedCount: 5,
          updatedAt: '2024-01-14T08:20:00.000Z',
        },
      ],
    },
  },
  responses: [
    {
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении статистики',
    },
  ],
};
