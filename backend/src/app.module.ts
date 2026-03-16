import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { JwtStrategy } from './guards/jwt.strategy';
import { KeyStorageModule } from './modules/key-storage/key-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    KeyStorageModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
