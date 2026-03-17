import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { JwtStrategy } from './guards/jwt.strategy';
import { KeyStorageModule } from './modules/key-storage/key-storage.module';
import { AiModule } from './modules/merge-game/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    KeyStorageModule,
    AiModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
