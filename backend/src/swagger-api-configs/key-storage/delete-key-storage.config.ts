import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const deleteKeyStorageConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Удаление записи из хранилища',
    description: 'Удаляет запись из хранилища по указанному ключу',
  },
  queries: [
    {
      name: 'key',
      required: true,
      type: String,
      description: 'Ключ для удаления записи',
      example: 'user_settings',
    },
  ],
  okResponse: {
    description: 'Запись успешно удалена',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426655440000',
        key: 'user_settings',
        storage: { theme: 'dark', language: 'ru' },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Запись с указанным ключом не найдена',
    },
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректный ключ',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при удалении записи',
    },
  ],
};
