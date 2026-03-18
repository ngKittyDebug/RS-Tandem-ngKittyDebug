import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Provider, User } from 'src/generated/prisma/browser';
import { hash, genSalt, compare } from 'bcrypt-ts';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interface/jwt-payload';
import { Response, Request } from 'express';
import ms from 'ms';
import { isDev } from 'src/utils/is-dev-util';
import { SignOptions } from 'jsonwebtoken';
import {
  AuthResponse,
  AuthTokens,
  LogoutResponse,
} from '../interface/auth-module-types';
import { Profile } from 'passport';

@Injectable()
export class AuthService {
  private readonly SALT: number;
  private readonly JWT_ACCESS_TOKEN_EXPIRE_TIME: string;
  private readonly JWT_REFRESH_TOKEN_EXPIRE_TIME: string;
  private readonly REDIRECT_FRONTEND: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.SALT = configService.getOrThrow<number>('BCRYPT_SALT');

    this.JWT_ACCESS_TOKEN_EXPIRE_TIME = configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_EXPIRE_TIME',
    );
    this.JWT_REFRESH_TOKEN_EXPIRE_TIME = configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_EXPIRE_TIME',
    );
    this.REDIRECT_FRONTEND =
      configService.getOrThrow<string>('REDIRECT_FRONTEND');
  }

  private readonly logger = new Logger(AuthService.name);

  async registration(res: Response, dto: CreateAuthDto): Promise<AuthResponse> {
    const existingUser = await this.findOne(dto);

    if (existingUser) {
      this.logger.error('Пользователь уже существует');
      throw new ConflictException(`Пользователь уже существует`);
    }

    const salts = await genSalt(+this.SALT);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hash(dto.password, salts),
        username: dto.username,
      },
      omit: {
        password: true,
      },
    });

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: Provider.local,
    };

    this.logger.log(`Пользователь с ${user.id} создан`);

    return this.auth(res, payload);
  }

  async githubOauth(res: Response, profile: Profile): Promise<AuthResponse> {
    const { id, username, emails, photos } = profile;

    const fallbackUsername = `${Provider.Github}_${id}`;
    const fallbackEmail = `github_${id}@users.noreply.github.com`;

    const user = await this.prisma.user.upsert({
      where: { providerId: id },
      update: {
        username: username ?? fallbackUsername,
        email: emails?.[0]?.value ?? fallbackEmail,
      },
      create: {
        providerId: id,
        username: username ?? fallbackUsername,
        email: emails?.[0]?.value ?? fallbackEmail,
        provider: Provider.Github,
        avatar: photos?.[0]?.value ?? null,
      },
    });

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: Provider.Github,
    };

    return this.auth(res, payload);
  }

  async login(res: Response, dto: LoginAuthDto): Promise<AuthResponse> {
    const user = await this.findOne(dto);

    if (!user) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new UnauthorizedException(
        `Пользователь не существует или неверный пароль`,
      );
    }

    if (user.provider !== Provider.local) {
      this.logger.error('Пользователь был зарегистрирован с помощью OAuth');
      throw new UnauthorizedException(
        'Пользователь был зарегистрирован с помощью OAuth',
      );
    }

    const validPass = await compare(dto.password, user.password);

    if (!validPass) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new UnauthorizedException(
        `Пользователь не существует или неверный пароль`,
      );
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
    };

    return this.auth(res, payload);
  }

  private auth(res: Response, payload: JwtPayload): AuthResponse {
    const { accessToken, refreshToken } = this.genJWTtokens(payload);

    const expiresMs = ms(this.JWT_REFRESH_TOKEN_EXPIRE_TIME as ms.StringValue);
    this.sendCookie(res, refreshToken, new Date(Date.now() + expiresMs));

    return { accessToken };
  }

  private async findOne(
    dto: CreateAuthDto | LoginAuthDto,
  ): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: dto.email,
              mode: 'insensitive',
            },
          },
          {
            username: {
              equals: dto.username,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }

  private genJWTtokens(payload: JwtPayload): AuthTokens {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRE_TIME as SignOptions['expiresIn'],
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRE_TIME as SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(req: Request, res: Response): Promise<AuthResponse> {
    const refresh = req.cookies.refreshToken as string | undefined;

    if (!refresh) {
      throw new UnauthorizedException('Токен больше не действителен');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);

    if (payload) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      return this.auth(res, user);
    }

    throw new UnauthorizedException('Токен больше не действителен');
  }

  private sendCookie(res: Response, token: string, expires: Date): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'lax' : 'none',
    });
  }

  logout(res: Response): LogoutResponse {
    this.sendCookie(res, 'refreshToken', new Date(0));

    return { logout: true };
  }

  redirect(res: Response) {
    res.redirect(this.REDIRECT_FRONTEND);
  }
}
