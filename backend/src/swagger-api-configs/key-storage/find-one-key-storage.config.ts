import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findOneKeyStorageConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получение записи по ключу',
    description: 'Возвращает запись из хранилища по указанному ключу',
  },
  queries: [
    {
      name: 'key',
      required: true,
      type: String,
      description: 'Ключ для поиска записи',
      example: 'user_settings',
    },
  ],
  okResponse: {
    description: 'Запись найдена',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-42665544000' },
        key: { type: 'string', example: 'user_settings' },
        storage: { type: 'object', example: { theme: 'dark', language: 'ru' } },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Запись с указанным ключом не найдена (возвращает null)',
    },
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректный ключ',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении записи',
    },
  ],
};
