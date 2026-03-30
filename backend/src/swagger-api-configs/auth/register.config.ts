import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CreateAuthDto } from '../../modules/auth/dto/create-auth.dto';

export const registerConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Регистрация нового пользователя',
    description:
      'Создаёт новый аккаунт с выдачей JWT токена. Требуются уникальные email и username.',
  },
  body: { type: CreateAuthDto },
  createdResponse: {
    description: 'Пользователь успешно зарегистрирован',
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
      description:
        'Некорректные данные (невалидный email, username или пароль)',
    },
    {
      status: HttpStatus.CONFLICT,
      description: 'Пользователь с таким email или username уже существует',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера при создании пользователя',
    },
  ],
};
