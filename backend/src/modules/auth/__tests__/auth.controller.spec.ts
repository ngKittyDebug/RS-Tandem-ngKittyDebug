import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { Response, Request } from 'express';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

interface AuthResponse {
  accessToken: string;
}

interface LogoutResponse {
  logout: boolean;
}

const createResponseMock = (): Response =>
  ({
    cookie: jest.fn(),
  }) as unknown as Response;

const createRequestMock = (cookies?: Record<string, string>): Request =>
  ({
    cookies: cookies || {},
  }) as unknown as Request;

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: DeepMockProxy<AuthService>;
  let responseMock: Response;

  const mockCreateAuthDto: CreateAuthDto = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
  };

  const mockLoginAuthDto: LoginAuthDto = {
    email: 'test@example.com',
    username: '',
    password: 'password123',
  };

  beforeEach(async () => {
    authServiceMock = mockDeep<AuthService>();
    responseMock = createResponseMock();

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
      const mockResult: AuthResponse = { accessToken: 'access-token' };
      authServiceMock.registration.mockResolvedValue(mockResult);

      const result = await controller.create(mockCreateAuthDto, responseMock);

      expect(authServiceMock.registration).toHaveBeenCalledWith(
        responseMock,
        mockCreateAuthDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const mockResult: AuthResponse = { accessToken: 'access-token' };
      authServiceMock.login.mockResolvedValue(mockResult);

      const result = await controller.login(mockLoginAuthDto, responseMock);

      expect(authServiceMock.login).toHaveBeenCalledWith(
        responseMock,
        mockLoginAuthDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh and return result', async () => {
      const mockResult: AuthResponse = { accessToken: 'new-access-token' };
      authServiceMock.refresh.mockResolvedValue(mockResult);
      const req = createRequestMock();

      const result = await controller.refresh(responseMock, req);

      expect(authServiceMock.refresh).toHaveBeenCalledWith(req, responseMock);
      expect(result).toEqual(mockResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return result', () => {
      const mockResult: LogoutResponse = { logout: true };
      authServiceMock.logout.mockReturnValue(mockResult);

      const result = controller.logout(responseMock);

      expect(authServiceMock.logout).toHaveBeenCalledWith(responseMock);
      expect(result).toEqual(mockResult);
    });
  });
});
