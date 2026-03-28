import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllKeyStorageConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение всех записей хранилища',
    description: 'Возвращает массив всех записей в хранилище',
  },
  okResponse: {
    description: 'Список всех записей хранилища',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-42665544000',
          },
          key: { type: 'string', example: 'user_settings' },
          storage: {
            type: 'object',
            example: { theme: 'dark', language: 'ru' },
          },
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении записей',
    },
  ],
};
