import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CreateQuestionDto } from '../../modules/games/merge-game/question/dto/create-question.dto';

export const createQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Создать новый вопрос' },
  body: { type: CreateQuestionDto },
  queries: [{ name: 'wordId', type: Number, description: 'ID слова' }],
  createdResponse: { description: 'Вопрос успешно создан' },
  responses: [
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
    {
      status: HttpStatus.CONFLICT,
      description: 'Вопрос с таким содержанием уже существует',
    },
  ],
};
