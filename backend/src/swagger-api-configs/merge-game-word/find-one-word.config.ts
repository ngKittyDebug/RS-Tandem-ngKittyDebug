import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить слово по ID' },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: {
    description: 'Слово успешно получено',
    schema: {
      example: {
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
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректный ID' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении слова',
    },
  ],
};
