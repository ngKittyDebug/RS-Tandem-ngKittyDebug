import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneDataConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получить данные игры по ID',
    description: 'Возвращает категорию с вложенными словами и вопросами по ID',
  },
  params: [{ name: 'id', type: Number, description: 'ID данных' }],
  okResponse: {
    description: 'Данные успешно получены',
    schema: {
      example: {
        id: 1,
        category: 'Животные',
        words: [
          {
            id: 1,
            word: 'Кошка',
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
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Данные не найдены' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректный ID' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении данных',
    },
  ],
};
