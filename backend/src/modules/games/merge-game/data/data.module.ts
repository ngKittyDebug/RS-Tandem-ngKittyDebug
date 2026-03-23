import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';

@Module({
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
