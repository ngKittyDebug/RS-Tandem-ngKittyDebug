import { Injectable, Logger } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(UserService.name);

  public async findOne(id: string) {
    return await this.prisma.user.findFirst({
      where: {
        id: id,
      },
      omit: {
        password: true,
        updatedAt: true,
      },
    });
  }
}
