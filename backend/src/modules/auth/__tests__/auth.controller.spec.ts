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

    it('should throw error if authService.signIn throws', async () => {
      const error = new Error('Registration failed');
      authServiceMock.signIn.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateAuthDto, mockResponse),
      ).rejects.toThrow(error);
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

    it('should throw error if authService.login throws', async () => {
      const error = new Error('Login failed');
      authServiceMock.login.mockRejectedValue(error);

      await expect(
        controller.login(mockLoginAuthDto, mockResponse),
      ).rejects.toThrow(error);
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

    it('should throw error if authService.refresh throws', async () => {
      const error = new Error('Refresh failed');
      authServiceMock.refresh.mockRejectedValue(error);

      await expect(
        controller.refresh(mockResponse, mockRequest),
      ).rejects.toThrow(error);
    });

    it('should handle request with cookies', async () => {
      const mockResult = { accessToken: 'new-access-token' };
      const reqWithCookies = {
        cookies: { refreshToken: 'some-token' },
      } as unknown as Request;
      authServiceMock.refresh.mockResolvedValue(mockResult);

      await controller.refresh(mockResponse, reqWithCookies);

      expect(authServiceMock.refresh).toHaveBeenCalledWith(
        reqWithCookies,
        mockResponse,
      );
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

    it('should throw error if authService.logout throws', () => {
      const error = new Error('Logout failed');
      authServiceMock.logout.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.logout(mockResponse)).toThrow(error);
    });
  });
});
