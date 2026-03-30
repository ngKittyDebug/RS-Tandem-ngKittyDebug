import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CreateKeyStorageDto } from '../../modules/key-storage/dto/create-key-storage.dto';

export const createKeyStorageConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Создание или обновление записи в хранилище',
    description:
      'Создаёт новую запись в хранилище по ключу или обновляет существующую (upsert)',
  },
  body: {
    type: CreateKeyStorageDto,
    description: 'Данные для создания/обновления записи',
    examples: {
      default: {
        summary: 'Пример сохранения объекта',
        value: {
          key: 'user_settings',
          storage: { theme: 'dark', language: 'ru' },
        },
      },
    },
  },
  createdResponse: {
    description: 'Запись успешно создана или обновлена',
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
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректные данные',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при создании/обновлении записи',
    },
  ],
};
