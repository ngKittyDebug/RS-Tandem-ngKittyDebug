import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

// Мокаем весь модуль PrismaService
jest.mock('prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAuthDto: CreateAuthDto = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'test-uuid',
      email: createAuthDto.email,
      password: createAuthDto.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createAuthDto);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: createAuthDto.email,
          password: createAuthDto.password,
        },
      });
    });

    it('should throw an error if user creation fails', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createAuthDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a string with the id', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 auth');
    });
  });

  describe('update', () => {
    const updateAuthDto: Partial<CreateAuthDto> = {
      email: 'updated@gmail.com',
    };

    it('should call console.log and return a string', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = service.update(1, updateAuthDto);

      expect(console.log).toHaveBeenCalledWith(updateAuthDto);
      expect(result).toBe('This action updates a #1 auth');
    });
  });

  describe('remove', () => {
    it('should return a string with the id', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 auth');
    });
  });
});
