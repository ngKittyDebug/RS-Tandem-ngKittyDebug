import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { QuestionModule } from './question/question.module';
import { WordModule } from './word/word.module';

@Module({
  imports: [DataModule, QuestionModule, WordModule],
  exports: [DataModule, QuestionModule, WordModule],
})
export class MergeGameModule {}
