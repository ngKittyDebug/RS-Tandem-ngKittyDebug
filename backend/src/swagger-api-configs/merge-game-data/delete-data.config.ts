import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const deleteDataConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Удалить данные игры',
    description: 'Удаляет категорию и все связанные слова и вопросы',
  },
  params: [{ name: 'id', type: Number, description: 'ID данных' }],
  okResponse: {
    description: 'Данные успешно удалены',
    schema: {
      example: {
        message: 'MergeGameData с id 1 успешно удалена',
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Данные не найдены' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректный ID' },
  ],
};
