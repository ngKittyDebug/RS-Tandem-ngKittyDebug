import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { LoginAuthDto } from '../../modules/auth/dto/login-auth.dto';

export const loginConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Вход в систему',
    description:
      'Аутентификация пользователя по email/username и паролю. Возвращает JWT токен.',
  },
  body: { type: LoginAuthDto },
  okResponse: {
    description: 'Успешный вход',
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректные данные',
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      description: 'Неверные учётные данные (email/username или пароль)',
    },
  ],
};
