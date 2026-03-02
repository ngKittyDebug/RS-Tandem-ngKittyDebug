import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt-ts';

jest.mock('bcrypt-ts', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockResponse = {
  cookie: jest.fn(),
} as unknown as Response;

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

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedPassword',
};

const mockAccessToken = 'access-token';
const mockRefreshToken = 'refresh-token';

const createConfigServiceMock = () => ({
  provide: ConfigService,
  useValue: {
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string | number> = {
        BCRYPT_SALT: 10,
        JWT_ACCESS_TOKEN_EXPIRE_TIME: '15m',
        JWT_REFRESH_TOKEN_EXPIRE_TIME: '7d',
        DOMAIN: 'localhost',
        JWT_SECRET_KEY: 'test-secret',
      };
      return config[key];
    }),
  },
});

const createJwtServiceMock = () => ({
  provide: JwtService,
  useValue: {
    sign: jest.fn((_, options) => {
      return (options as { expiresIn?: string })?.expiresIn === '15m'
        ? mockAccessToken
        : mockRefreshToken;
    }),
    verifyAsync: jest.fn(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  const prismaMock = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        createConfigServiceMock(),
        createJwtServiceMock(),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw ConflictException if user already exists', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);

      await expect(
        service.signIn(mockResponse, mockCreateAuthDto),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should create a new user and return accessToken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prismaMock.user.create.mockResolvedValue({
        id: '1',
        email: mockCreateAuthDto.email,
        username: mockCreateAuthDto.username,
      } as never);

      const result = await service.signIn(mockResponse, mockCreateAuthDto);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateAuthDto.email,
          password: 'hashedPassword',
          username: mockCreateAuthDto.username,
        },
        omit: { password: true },
      });

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw ForbiddenException if user does not exist', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login(mockResponse, mockLoginAuthDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(mockResponse, mockLoginAuthDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should login user and return accessToken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(mockResponse, mockLoginAuthDto);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refreshToken is not present', async () => {
      const req = { cookies: {} } as unknown as Request;

      await expect(service.refresh(req, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refreshToken is invalid', async () => {
      const req = {
        cookies: { refreshToken: 'invalid-token' },
      } as unknown as Request;
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(service.refresh(req, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const req = {
        cookies: { refreshToken: mockRefreshToken },
      } as unknown as Request;
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ id: '1' });
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(req, mockResponse)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      const req = {
        cookies: { refreshToken: mockRefreshToken },
      } as unknown as Request;
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ id: '1' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      } as never);

      const result = await service.refresh(req, mockResponse);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie and return logout status', () => {
      const result = service.logout(mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          domain: 'localhost',
          sameSite: 'none',
          secure: false,
        }),
      );

      expect(result).toEqual({ logout: true });
    });
  });
});
