import { Reflector } from '@nestjs/core';
import { Role } from 'src/generated/prisma/enums';

export const Roles = Reflector.createDecorator<Role>();
