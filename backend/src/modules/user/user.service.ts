import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { UserDto } from './dto/update-user.dto';
import { compare, genSalt, hash } from 'bcrypt-ts';
import { JwtPayload } from '../interface/jwt-payload';
import { ConfigService } from '@nestjs/config';
import { UpdateUserPassword } from './dto/update-user-pass';

@Injectable()
export class UserService {
  private readonly SALT: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.SALT = configService.getOrThrow<number>('BCRYPT_SALT');
  }

  private readonly logger = new Logger(UserService.name);

  public async findOne(req: Request) {
    const users = req.user as JwtPayload;

    return await this.prisma.user.findUnique({
      where: {
        id: users.id,
      },
      omit: {
        password: true,
        updatedAt: true,
        role: true,
        id: true,
      },
    });
  }

  async deleteUser(req: Request, dto: UserDto) {
    const users = req.user as JwtPayload;
    const user = await this.prisma.user.findUnique({
      where: {
        id: users.id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const validPass = await compare(dto.password, user.password);

    if (!validPass) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new ForbiddenException(
        `Пользователь не существует или неверный пароль`,
      );
    }

    await this.prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  }

  async updateUser(req: Request, dto: UserDto) {
    const users = req.user as JwtPayload;

    const user = await this.prisma.user.findUnique({
      where: {
        id: users.id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const validPass = await compare(dto.password, user.password);

    if (!validPass) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new ForbiddenException(
        `Пользователь не существует или неверный пароль`,
      );
    }

    const isExists = await this.prisma.user.findFirst({
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

    if (isExists) {
      throw new ConflictException('Имя или Email уже заняты');
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        username: dto.username,
        email: dto.email,
      },
      select: {
        email: true,
        username: true,
      },
    });
  }

  async updatePassword(req: Request, dto: UpdateUserPassword) {
    const users = req.user as JwtPayload;

    const user = await this.prisma.user.findUnique({
      where: {
        id: users.id,
      },
      select: {
        password: true,
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const validPass = await compare(dto.oldPassword, user.password);

    if (!validPass) {
      this.logger.error('Пользователь не существует или неверный пароль');
      throw new ForbiddenException(
        `Пользователь не существует или неверный пароль`,
      );
    }
    const salts = await genSalt(+this.SALT);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hash(dto.newPassword, salts),
      },
    });

    return { success: true };
  }
}
