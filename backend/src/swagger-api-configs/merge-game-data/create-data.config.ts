import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CreateDataDto } from '../../modules/games/merge-game/data/dto/create-data.dto';

export const createDataConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Создать новую категорию данных игры',
    description: 'Создаёт новую категорию с вложенными словами и вопросами',
  },
  body: { type: CreateDataDto },
  createdResponse: {
    description: 'Данные успешно созданы',
    schema: {
      example: {
        id: 1,
        category: 'Животные',
        words: [
          {
            id: 1,
            word: 'Кошка',
            questions: [
              {
                id: 1,
                question: 'Мяукает',
                answer: 'Кошка',
                keywords: ['животное'],
              },
            ],
          },
        ],
      },
    },
  },
  responses: [
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
    {
      status: HttpStatus.CONFLICT,
      description: 'Категория с таким названием уже существует',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при создании данных',
    },
  ],
};
