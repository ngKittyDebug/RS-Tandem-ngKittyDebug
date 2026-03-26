import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить все вопросы или вопросы по ID слова' },
  queries: [
    {
      name: 'wordId',
      required: false,
      type: Number,
      description: 'Фильтр по ID слова',
    },
  ],
  okResponse: {
    description: 'Список вопросов успешно получен',
    schema: {
      example: [
        {
          id: 1,
          question: 'Мяукает',
          answer: 'Кошка',
          keywords: ['животное', 'звук'],
          wordId: 1,
        },
      ],
    },
  },
  responses: [
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении вопросов',
    },
  ],
};
