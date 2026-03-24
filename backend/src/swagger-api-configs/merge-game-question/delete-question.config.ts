import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const deleteQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Удалить вопрос' },
  params: [{ name: 'id', type: Number, description: 'ID вопроса' }],
  okResponse: { description: 'Вопрос успешно удален' },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Вопрос не найден' },
  ],
};
