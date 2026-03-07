import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      authServiceMock.create.mockResolvedValue(mockUser);

      const result = await controller.create(createAuthDto);

      expect(result).toEqual(mockUser);
      expect(authServiceMock.create).toHaveBeenCalledWith(createAuthDto);
    });
  });

  describe('update', () => {
    const updateAuthDto: Partial<CreateAuthDto> = {
      email: 'updated@gmail.com',
    };

    it('should update auth by id', () => {
      authServiceMock.update.mockReturnValue('This action updates a #1 auth');

      const result = controller.update('1', updateAuthDto);

      expect(result).toBe('This action updates a #1 auth');
      expect(authServiceMock.update).toHaveBeenCalledWith(1, updateAuthDto);
    });
  });

  describe('remove', () => {
    it('should remove auth by id', () => {
      authServiceMock.remove.mockReturnValue('This action removes a #1 auth');

      const result = controller.remove('1');

      expect(result).toBe('This action removes a #1 auth');
      expect(authServiceMock.remove).toHaveBeenCalledWith(1);
    });
  });
});
