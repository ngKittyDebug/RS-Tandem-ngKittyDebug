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
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request, Response } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { AuthResponse, LogoutResponse } from '../interface/auth-module-types';
import { AuthGuard } from '@nestjs/passport';
import { Github } from 'src/decorators/github.decorator';
import { Profile } from 'passport-github2';
import { ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  registerConfig,
  loginConfig,
  refreshConfig,
  logoutConfig,
} from 'src/swagger-api-configs/auth';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerConfigRefresh } from 'src/config/throttler.config';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { JwtPayload } from '../interface/jwt-payload';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiSwagger(registerConfig)
  @Post('register')
  create(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.registration(res, createAuthDto);
  }

  @Public()
  @ApiSwagger(loginConfig)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.authService.login(res, loginAuthDto);
  }

  @ApiSwagger(refreshConfig)
  @Public()
  @Post('refresh')
  @Throttle({ default: ThrottlerConfigRefresh })
  @HttpCode(HttpStatus.OK)
  refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    return this.authService.refresh(req, res);
  }

  @ApiSwagger(logoutConfig)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(
    @User() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponse> {
    return this.authService.logout(res, user);
  }

  @Public()
  @ApiExcludeEndpoint()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Public()
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
