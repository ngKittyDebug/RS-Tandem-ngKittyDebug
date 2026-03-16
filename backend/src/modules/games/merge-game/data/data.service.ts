import { Injectable } from '@nestjs/common';
import { CreateDataDto, UpdateDataDto } from '../merge-game.interfaces';
@Injectable()
export class DataService {
  create(createDataDto: CreateDataDto) {
    console.log(createDataDto);
    return 'This action adds a new datum';
  }

  findAll() {
    return `This action returns all data`;
  }

  findOne(id: number) {
    return `This action returns a #${id} datum`;
  }

  update(id: number, updateDataDto: UpdateDataDto) {
    console.log(updateDataDto);
    return `This action updates a #${id} datum`;
  }

  remove(id: number) {
    return `This action removes a #${id} datum`;
  }
}
