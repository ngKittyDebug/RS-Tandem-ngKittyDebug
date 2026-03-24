import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { QuestionModule } from './question/question.module';
import { WordModule } from './word/word.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [DataModule, QuestionModule, WordModule, AiModule],
  exports: [DataModule, QuestionModule, WordModule, AiModule],
})
export class MergeGameModule {}
