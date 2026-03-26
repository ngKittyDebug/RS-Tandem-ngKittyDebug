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
        userId: 'user-123',
        gameType: 'MERGE_GAME',
        totalGames: 10,
        wins: 7,
        losses: 3,
        winRate: 0.7,
        bestScore: 1500,
        createdAt: '2024-01-01T00:00:00.000Z',
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
  ],
};
