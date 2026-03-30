import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить все слова или слова по ID категории' },
  queries: [
    {
      name: 'dataId',
      required: false,
      type: Number,
      description: 'Фильтр по ID категории',
    },
  ],
  okResponse: {
    description: 'Список слов успешно получен',
    schema: {
      example: [
        {
          id: 1,
          word: 'Кошка',
          dataId: 1,
          questions: [
            {
              id: 1,
              question: 'Мяукает',
              answer: 'Кошка',
              keywords: ['животное'],
            },
          ],
        },
      ],
    },
  },
  responses: [
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении слов',
    },
  ],
};
