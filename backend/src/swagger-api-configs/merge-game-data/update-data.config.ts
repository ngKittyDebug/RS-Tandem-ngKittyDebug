import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UpdateDataDto } from '../../modules/games/merge-game/data/dto/update-data.dto';

export const updateDataConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Обновить данные игры',
    description: 'Обновляет категорию и её содержимое (слова и вопросы)',
  },
  body: { type: UpdateDataDto },
  params: [{ name: 'id', type: Number, description: 'ID данных' }],
  okResponse: {
    description: 'Данные успешно обновлены',
    schema: {
      example: {
        id: 1,
        category: 'Животные обновлённые',
        words: [
          {
            id: 1,
            word: 'Собака',
            questions: [{ id: 1, question: 'Лает', answer: 'Собака' }],
          },
        ],
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Данные не найдены' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
  ],
};
