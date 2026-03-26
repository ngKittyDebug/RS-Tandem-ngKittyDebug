import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { GameType } from 'src/generated/prisma/enums';

export const getAllUserGamesStatsConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение всей статистики пользователя по всем играм',
    description:
      'Возвращает полную статистику пользователя по всем доступным играм.',
  },
  okResponse: {
    description: 'Статистика успешно получена',
    schema: {
      example: {
        MERGE_GAME: {
          userId: 'user-123',
          gameType: GameType.mergeGame,
          totalGames: 10,
          wins: 7,
          losses: 3,
          winRate: 0.7,
          bestScore: 1500,
        },
        ANOTHER_GAME: {
          userId: 'user-123',
          gameType: 'ANOTHER_GAME',
          totalGames: 5,
          wins: 3,
          losses: 2,
          winRate: 0.6,
          bestScore: 1200,
        },
      },
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
  ],
};
