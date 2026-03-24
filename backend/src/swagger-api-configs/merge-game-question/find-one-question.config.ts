import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить вопрос по ID' },
  params: [{ name: 'id', type: Number, description: 'ID вопроса' }],
  okResponse: { description: 'Вопрос успешно получен' },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Вопрос не найден' },
  ],
};
