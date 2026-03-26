import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { GameType } from 'src/generated/prisma/enums';

export const updateUserStatConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Обновление игровой статистики пользователя',
    description:
      'Обновляет статистику пользователя для указанной игры на основе его текущих результатов.',
  },
  queries: [
    {
      name: 'game',
      required: true,
      enum: GameType,
      description: 'Тип игры для обновления статистики',
      example: GameType.mergeGame,
    },
  ],
  okResponse: {
    description: 'Статистика успешно обновлена',
    schema: {
      example: {
        gameType: 'mergeGame',
        playedCount: 1,
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
      description: 'Пользователь не найден',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при обновлении статистики',
    },
  ],
};
