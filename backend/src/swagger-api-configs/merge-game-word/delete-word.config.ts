import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const deleteWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Удалить слово' },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: {
    description: 'Слово успешно удалено',
    schema: {
      example: {
        message: 'Word с id 1 успешно удален',
      },
    },
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректный ID' },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при удалении слова',
    },
  ],
};
