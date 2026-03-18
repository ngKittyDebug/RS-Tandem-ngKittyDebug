import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CreateWordDto } from '../../modules/games/merge-game/word/dto/create-word.dto';

export const createWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Создать новое слово' },
  body: { type: CreateWordDto },
  queries: [
    {
      name: 'dataId',
      type: Number,
      description: 'ID категории данных',
    },
  ],
  createdResponse: {
    description: 'Слово успешно создано',
  },
  responses: [
    { status: HttpStatus.BAD_REQUEST, description: 'Некорректные данные' },
    {
      status: HttpStatus.CONFLICT,
      description: 'Слово с таким названием уже существует',
    },
  ],
};
