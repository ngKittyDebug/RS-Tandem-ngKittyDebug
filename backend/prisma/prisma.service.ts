import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  public constructor() {
    const connectionString = `${process.env.MODE ? process.env.DEVELOPMENT_POSTGRES : process.env.DIRECT_URL}`;

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
  async onModuleInit() {
    const start = Date.now();

    this.logger.log('Try to connect');

    try {
      await this.$connect();
      const sec = Date.now() - start;

      this.logger.log(`Is connected time: ${sec}`);
    } catch (error) {
      this.logger.log(`Fail to connect ${error}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.log(`Fail to disconnect ${error}`);
      throw error;
    }
  }
}
