import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllDataConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Получить все данные игры с пагинацией',
    description: 'Возвращает список всех категорий с пагинацией',
  },
  queries: [
    {
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы (по умолчанию 1)',
    },
    {
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество элементов на странице (по умолчанию 10)',
    },
    {
      name: 'category',
      required: false,
      type: String,
      description: 'Фильтр по категории (частичное совпадение)',
    },
  ],
  okResponse: {
    description: 'Список данных успешно получен',
    schema: {
      example: {
        data: [
          {
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
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректные параметры пагинации',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при получении данных',
    },
  ],
};
