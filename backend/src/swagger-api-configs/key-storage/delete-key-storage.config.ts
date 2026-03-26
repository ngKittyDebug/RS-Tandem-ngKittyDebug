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
  },
  responses: [
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Запись с указанным ключом не найдена',
    },
  ],
};
