import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { Response, Request } from 'express';

const mockResponse = {
  cookie: jest.fn(),
} as unknown as Response;

const mockRequest = {
  cookies: {},
} as unknown as Request;

const mockCreateAuthDto: CreateAuthDto = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123',
};

const mockLoginAuthDto: LoginAuthDto = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      signIn: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
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

  describe('create (register)', () => {
    it('should call authService.signIn and return result', async () => {
      const mockResult = { accessToken: 'access-token' };
      authServiceMock.signIn.mockResolvedValue(mockResult);

      const result = await controller.create(mockCreateAuthDto, mockResponse);

      expect(authServiceMock.signIn).toHaveBeenCalledWith(
        mockResponse,
        mockCreateAuthDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const mockResult = { accessToken: 'access-token' };
      authServiceMock.login.mockResolvedValue(mockResult);

      const result = await controller.login(mockLoginAuthDto, mockResponse);

      expect(authServiceMock.login).toHaveBeenCalledWith(
        mockResponse,
        mockLoginAuthDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh and return result', async () => {
      const mockResult = { accessToken: 'new-access-token' };
      authServiceMock.refresh.mockResolvedValue(mockResult);

      const result = await controller.refresh(mockResponse, mockRequest);

      expect(authServiceMock.refresh).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return result', () => {
      const mockResult = { logout: true };
      authServiceMock.logout.mockReturnValue(mockResult);

      const result = controller.logout(mockResponse);

      expect(authServiceMock.logout).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockResult);
    });
  });
});
