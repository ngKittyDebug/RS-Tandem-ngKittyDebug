import { Injectable } from '@nestjs/common';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { UpdateKeyStorageDto } from './dto/update-key-storage.dto';

@Injectable()
export class KeyStorageService {
  create(createKeyStorageDto: CreateKeyStorageDto) {
    console.log(createKeyStorageDto);
    return 'This action adds a new keyStorage';
  }

  findAll() {
    return `This action returns all keyStorage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} keyStorage`;
  }

  update(id: number, updateKeyStorageDto: UpdateKeyStorageDto) {
    console.log(updateKeyStorageDto);
    return `This action updates a #${id} keyStorage`;
  }

  remove(id: number) {
    return `This action removes a #${id} keyStorage`;
  }
}
