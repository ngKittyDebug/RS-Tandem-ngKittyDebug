import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { AuthResponse, LogoutResponse } from '../interface/auth-module-types';
import { AuthGuard } from '@nestjs/passport';
import { Github } from 'src/decorators/github.decorator';
import { Profile } from 'passport-github2';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description:
      'Создаёт новый аккаунт с выдачей JWT токена. Требуются уникальные email и username.',
  })
  @ApiBody({ type: CreateAuthDto })
  @ApiCreatedResponse({
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные (невалидный email, username или пароль)',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email или username уже существует',
  })
  @Post('register')
  create(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.registration(res, createAuthDto);
  }

  @ApiOperation({
    summary: 'Вход в систему',
    description:
      'Аутентификация пользователя по email/username и паролю. Возвращает JWT токен.',
  })
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({
    description: 'Успешный вход',
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 403,
    description: 'Неверные учётные данные (email/username или пароль)',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(res, loginAuthDto);
  }

  @ApiOperation({
    summary: 'Обновление токенов',
    description:
      'Обновляет JWT токен с использованием refresh токена из cookies.\n\n' +
      '**Требует:** Cookie с именем `refreshToken`',
  })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh токен недействителен или истёк',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    return this.authService.refresh(req, res);
  }

  @ApiOperation({
    summary: 'Выход из системы',
    description: 'Очищает refresh токен из cookies и завершает сессию.',
  })
  @ApiOkResponse({
    description: 'Успешный выход',
    schema: {
      example: {
        logout: true,
      },
    },
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): LogoutResponse {
    return this.authService.logout(res);
  }

  @ApiExcludeEndpoint()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @ApiExcludeEndpoint()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Github() profile: Profile,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.githubOauth(res, profile);
    this.authService.redirect(res);
  }
}
