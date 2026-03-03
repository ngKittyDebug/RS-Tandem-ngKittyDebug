import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';

interface AuthResponse {
  accessToken: string;
}

interface LogoutResponse {
  logout: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Создает пользователя',
    description:
      'Посылаем POST запрос на создание нового пользователя в таблице',
  })
  @Post('register')
  create(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.signIn(res, createAuthDto);
  }

  @ApiOperation({
    summary: 'Логин пользователя',
    description:
      'Посылаем POST запрос на логин пользователя, возвращает accessToken в теле ответа и устанавливает в куках refreshToken',
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
    summary: 'Получить новые refreshToken',
    description:
      'Посылаем POST запрос на выдачу нового refreshToken, сервер принимает cookies и забирает из него нужный токен и валидирует его',
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
    summary: 'Удаляет токен из лул',
    description: 'Посылаем POST запрос на на удаление кук с фронта',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): LogoutResponse {
    return this.authService.logout(res);
  }
}
