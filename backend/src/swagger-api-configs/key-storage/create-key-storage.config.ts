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
  },
};
