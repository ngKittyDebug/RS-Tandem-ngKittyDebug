import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export function getJwtConfig(configService: ConfigService): JwtModuleOptions {
  return {
    secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
    verifyOptions: {
      ignoreExpiration: false,
    },
  };
}
