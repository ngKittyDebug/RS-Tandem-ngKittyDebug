import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить вопрос по ID' },
  params: [{ name: 'id', type: Number, description: 'ID вопроса' }],
  okResponse: {
    description: 'Вопрос успешно получен',
    schema: {
      example: {
        id: 1,
        question: 'Мяукает',
        answer: 'Кошка',
        keywords: ['животное', 'звук'],
        wordId: 1,
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Вопрос не найден' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректный ID' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении вопроса',
    },
  ],
};
