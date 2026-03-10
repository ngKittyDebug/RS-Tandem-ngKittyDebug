import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('MeowVault API')
  .setDescription(
    'MeowVault — это уютный учебный каталог с несколькими играми, которые помогают прокачать знания JavaScript, TypeScript.\n\n' +
      '## Авторизация\n\n' +
      'Для работы с защищёнными эндпоинтами необходимо получить JWT токен через `/auth/login` или `/auth/register`.\n\n' +
      '## Как использовать\n\n' +
      '1. Зарегистрируйтесь или войдите в систему\n' +
      '2. Скопируйте полученный `accessToken`\n' +
      '3. Нажмите кнопку **Authorize** и вставьте токен\n' +
      '4. Теперь можно тестировать защищённые эндпоинты',
  )
  .setVersion('1.0')
  .addTag(
    'Auth',
    'Эндпоинты аутентификации: регистрация, вход, обновление токена, выход',
  )
  .addTag('User', 'Эндпоинты управления профилем пользователя')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Введите JWT токен в формате: `ваш_токен`',
  })
  .build();
