import { Module } from '@nestjs/common';
import { KeyStorageService } from './key-storage.service';
import { KeyStorageController } from './key-storage.controller';

@Module({
  controllers: [KeyStorageController],
  providers: [KeyStorageService],
})
export class KeyStorageModule {}
