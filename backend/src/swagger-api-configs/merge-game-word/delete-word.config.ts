import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const deleteWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Удалить слово' },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: { description: 'Слово успешно удалено' },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
  ],
};
