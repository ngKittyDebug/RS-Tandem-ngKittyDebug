import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAuthDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    return await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
