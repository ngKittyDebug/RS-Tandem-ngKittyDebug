import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UpdateQuestionDto } from '../../modules/games/merge-game/question/dto/update-question.dto';

export const updateQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Обновить вопрос' },
  body: { type: UpdateQuestionDto },
  params: [{ name: 'id', type: Number, description: 'ID вопроса' }],
  okResponse: {
    description: 'Вопрос успешно обновлен',
    schema: {
      example: {
        id: 1,
        question: 'Лает',
        answer: 'Собака',
        keywords: ['животное', 'звук'],
        wordId: 1,
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Вопрос не найден' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при обновлении вопроса',
    },
  ],
};
