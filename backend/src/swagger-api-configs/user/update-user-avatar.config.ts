import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { AvatarUpdateDto } from '../../modules/user/dto/update-avatar.dto';

export const updateUserAvatarConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Обновление аватара',
    description:
      'Обновляет URL аватара текущего пользователя. Требует валидный URL изображения.',
  },
  body: { type: AvatarUpdateDto },
  okResponse: {
    description: 'Аватар успешно обновлён',
    schema: {
      example: {
        avatar: 'https://example.com/avatars/user123.jpg',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректный URL аватара',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
  ],
};
