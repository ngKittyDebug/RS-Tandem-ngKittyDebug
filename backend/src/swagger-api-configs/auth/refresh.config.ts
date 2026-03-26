import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const refreshConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Обновление токенов',
    description:
      'Обновляет JWT токен с использованием refresh токена из cookies.\n\n' +
      '**Требует:** Cookie с именем `refreshToken`',
  },
  okResponse: {
    description: 'Токены успешно обновлены',
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh токен недействителен или истёк',
    },
    {
      status: HttpStatus.NOT_FOUND,
      description: 'Пользователь не найден',
    },
  ],
};
