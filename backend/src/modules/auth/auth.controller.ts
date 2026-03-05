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
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';

interface AuthResponse {
  accessToken: string;
}

interface LogoutResponse {
  logout: boolean;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: CreateAuthDto })
  @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован' })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  @Post('register')
  create(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.signIn(res, createAuthDto);
  }

  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 403, description: 'Неверные учётные данные' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(res, loginAuthDto);
  }

  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({ status: 401, description: 'Токен недействителен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    return this.authService.refresh(req, res);
  }

  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): LogoutResponse {
    return this.authService.logout(res);
  }
}
