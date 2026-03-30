import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UpdateWordDto } from '../../modules/games/merge-game/word/dto/update-word.dto';

export const updateWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Обновить слово' },
  body: { type: UpdateWordDto },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: {
    description: 'Слово успешно обновлено',
    schema: {
      example: {
        id: 1,
        word: 'Собака',
        dataId: 1,
        questions: [
          { id: 1, question: 'Лает', answer: 'Собака', keywords: ['животное'] },
        ],
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при обновлении слова',
    },
  ],
};
