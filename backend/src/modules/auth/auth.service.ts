import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/generated/prisma/browser';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(AuthService.name);

  async create(data: CreateAuthDto): Promise<User> {
    const existingUser = await this.findOne(data);

    if (existingUser) {
      this.logger.error('Пользователь уже существует');
      throw new ConflictException(`Пользователь уже существует`);
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
      },
    });

    this.logger.log(`Пользователь с ${user.id} создан`);

    return user;
  }

  async findOne(data: CreateAuthDto): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    this.logger.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
