import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';

export const logoutConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Выход из системы',
    description: 'Очищает refresh токен из cookies и завершает сессию.',
  },
  okResponse: {
    description: 'Успешный выход',
    schema: {
      example: {
        logout: true,
      },
    },
  },
};
