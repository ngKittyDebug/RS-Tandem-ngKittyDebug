import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';

@Module({
  controllers: [WordController],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule {}
