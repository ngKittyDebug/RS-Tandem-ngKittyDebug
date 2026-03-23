import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { UpdateWordDto } from '../../modules/games/merge-game/word/dto/update-word.dto';

export const updateWordConfig: ApiSwaggerConfig = {
  operation: { summary: 'Обновить слово' },
  body: { type: UpdateWordDto },
  params: [{ name: 'id', type: Number, description: 'ID слова' }],
  okResponse: {
    description: 'Слово успешно обновлено',
  },
  responses: [
    { status: HttpStatus.NOT_FOUND, description: 'Слово не найдено' },
  ],
};
