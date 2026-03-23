import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  createQuestionConfig,
  findAllQuestionConfig,
  findOneQuestionConfig,
  updateQuestionConfig,
  deleteQuestionConfig,
} from 'src/swagger-api-configs/merge-game-question';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';

@ApiAuth()
@ApiTags('Merge Game Questions')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiSwagger(findAllQuestionConfig)
  @Get()
  findAll(@Query('wordId') wordId?: string) {
    if (wordId) {
      return this.questionService.findByWordId(+wordId);
    }
    return this.questionService.findAll();
  }

  @ApiSwagger(createQuestionConfig)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Query('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.questionService.create(createQuestionDto, wordId);
  }

  @ApiSwagger(findOneQuestionConfig)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.findOne(id);
  }

  @ApiSwagger(updateQuestionConfig)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @ApiSwagger(deleteQuestionConfig)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.remove(id);
  }
}
