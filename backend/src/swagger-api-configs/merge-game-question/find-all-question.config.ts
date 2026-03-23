import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllQuestionConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить все вопросы или вопросы по ID слова' },
  queries: [
    {
      name: 'wordId',
      required: false,
      type: Number,
      description: 'Фильтр по ID слова',
    },
  ],
  okResponse: { description: 'Список вопросов успешно получен' },
};
