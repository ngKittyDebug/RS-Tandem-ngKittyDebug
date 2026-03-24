import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить слово по ID' },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: {
    description: 'Слово успешно получено',
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
  ],
};
