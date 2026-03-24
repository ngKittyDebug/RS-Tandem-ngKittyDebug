import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const findAllWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Получить все слова или слова по ID категории' },
  queries: [
    {
      name: 'dataId',
      required: false,
      type: Number,
      description: 'Фильтр по ID категории',
    },
  ],
  okResponse: {
    description: 'Список слов успешно получен',
  },
};
