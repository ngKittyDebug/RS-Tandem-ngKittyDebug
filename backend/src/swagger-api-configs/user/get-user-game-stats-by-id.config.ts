import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { GameType } from 'src/generated/prisma/enums';

export const getUserGameStatsByIdConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение статистики пользователя по конкретной игре',
    description:
      'Возвращает детальную статистику пользователя для указанной игры.',
  },
  queries: [
    {
      name: 'game',
      required: true,
      enum: GameType,
      description: 'Тип игры для получения статистики',
      example: GameType.mergeGame,
    },
  ],
  okResponse: {
    description: 'Статистика успешно получена',
    schema: {
      example: {
        gameType: 'mergeGame',
        playedCount: 10,
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректный тип игры',
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Статистика не найдена',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении статистики',
    },
  ],
};
