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
          id: { type: 'integer', example: 1 },
          key: { type: 'string', example: 'user_settings' },
          storage: {
            type: 'object',
            example: { theme: 'dark', language: 'ru' },
          },
        },
      },
    },
  },
};
