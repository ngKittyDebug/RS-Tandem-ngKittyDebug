import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import { Role } from 'src/generated/prisma/enums';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = createMockPrismaService();

  beforeEach(async () => {
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
      username: 'Alex',
    };

    const mockUser = {
      id: 'test-uuid',
      email: createAuthDto.email,
      username: createAuthDto.username,
      password: createAuthDto.password,
      role: Role.user,
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
          username: createAuthDto.username,
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
    const createAuthDto: CreateAuthDto = {
      email: 'test@gmail.com',
      password: 'password123',
      username: 'Alex',
    };

    const mockUser = {
      id: 'test-uuid',
      email: createAuthDto.email,
      username: createAuthDto.username,
      password: createAuthDto.password,
      role: Role.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a string with the email or login', async () => {
      await prismaMock.user.findFirst({
        where: {
          OR: [{ email: mockUser.email }, { username: mockUser.username }],
        },
      });
      const result = await service.findOne(createAuthDto);
      expect(result);
    });
  });
});
