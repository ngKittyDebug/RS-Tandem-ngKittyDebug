import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'src/generated/prisma/client';

export const createMockPrismaService = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};
