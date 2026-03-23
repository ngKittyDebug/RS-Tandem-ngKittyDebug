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
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  createWordConfig,
  findAllWordConfig,
  findOneWordConfig,
  updateWordConfig,
  deleteWordConfig,
} from 'src/swagger-api-configs/merge-game-word';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';

@ApiAuth()
@ApiTags('Merge Game Words')
@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @ApiSwagger(findAllWordConfig)
  @Get()
  findAll(@Query('dataId') dataId?: string) {
    if (dataId) {
      return this.wordService.findByDataId(+dataId);
    }
    return this.wordService.findAll();
  }

  @ApiSwagger(createWordConfig)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createWordDto: CreateWordDto,
    @Query('dataId', ParseIntPipe) dataId: number,
  ) {
    return this.wordService.create(createWordDto, dataId);
  }

  @ApiSwagger(findOneWordConfig)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordService.findOne(id);
  }

  @ApiSwagger(updateWordConfig)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordService.update(id, updateWordDto);
  }

  @ApiSwagger(deleteWordConfig)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordService.remove(id);
  }
}
