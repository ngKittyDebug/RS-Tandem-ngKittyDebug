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
import { ConfigService } from '@nestjs/config';
import { UpdateUserPassword } from './dto/update-user-pass.dto';
import { ConfirmPasswordDto } from './dto/delete-user-account.dto';
import { Provider, Prisma } from 'src/generated/prisma/client';
import { AvatarUpdateDto } from './dto/update-avater.dto';

@Injectable()
export class UserService {
  private readonly SALT: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.SALT = configService.getOrThrow<string>('BCRYPT_SALT');
  }

  private readonly logger = new Logger(UserService.name);

  public async gtUserProfile(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      omit: {
        password: true,
        updatedAt: true,
        role: true,
        id: true,
      },
    });
  }

  async deleteUser(id: string, dto: ConfirmPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        password: true,
        id: true,
        provider: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.provider === Provider.Github) {
      await this.prisma.user.delete({
        where: { id: user.id },
      });
      return { success: true };
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

  async updateUser(id: string, dto: UserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
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

    try {
      return await this.prisma.user.update({
        where: { id: user.id },
        data: { username: dto.username, email: dto.email },
        select: {
          username: true,
          email: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error?.code === 'P2002'
      ) {
        throw new ConflictException('Имя или Email уже заняты');
      }
      throw error;
    }
  }

  async updatePassword(id: string, dto: UpdateUserPassword) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
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

  async updateUserAvatar(id: string, dto: AvatarUpdateDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: dto.avatar },
      select: {
        avatar: true,
      },
    });
  }
}
