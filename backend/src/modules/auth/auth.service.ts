import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/generated/prisma/browser';
import { hash, genSalt, compare } from 'bcrypt-ts';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interface/jwt-payload';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  private SALT: number;
  private JWT_ACCESS_TOKEN_EXPIRE_TIME: string;
  private JWT_REFRESH_TOKEN_EXPIRE_TIME: string;

  private DOMAIN: string;

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

    this.DOMAIN = configService.getOrThrow<string>('DOMAIN');
  }

  private readonly logger = new Logger(AuthService.name);

  async signIn(res: Response, dto: CreateAuthDto) {
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
    };

    this.logger.log(`Пользователь с ${user.id} создан`);

    return this.auth(res, payload);
  }

  async login(res: Response, dto: LoginAuthDto) {
    const user = await this.findOne(dto);

    if (!user) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new ForbiddenException(
        `Пользователь не существует или неверный пароль`,
      );
    }
    const validPass = await compare(dto.password, user?.password);

    if (!validPass) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new ForbiddenException(
        `Пользователь не существует или неверный пароль`,
      );
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return this.auth(res, payload);
  }

  private auth(res: Response, payload: JwtPayload) {
    const { accessToken, refreshToken } = this.genJWTtokens(payload);

    this.sendCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private async findOne(dto: CreateAuthDto): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
  }

  private genJWTtokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRE_TIME as never,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRE_TIME as never,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(req: Request, res: Response) {
    const refresh = req.cookies['refreshToken'] as string;

    if (!refresh) {
      throw new UnauthorizedException('Токен все, гг вп');
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
        throw new NotFoundException('ти кто такой?');
      }

      return this.auth(res, user);
    }
  }

  private sendCookie(res: Response, token: string, expires: Date) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      domain: this.DOMAIN,
      expires,
      secure: false,
      sameSite: 'none',
    });
  }

  logout(res: Response) {
    this.sendCookie(res, 'refreshToken', new Date(0));

    return { logout: true };
  }
}
