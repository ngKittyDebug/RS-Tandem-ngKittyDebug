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
import { JwtPayload } from '../../interface/jwt-payload';

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

const mockLoginAuthDtoWithEmail: LoginAuthDto = {
  email: 'test@example.com',
  username: '',
  password: 'password123',
};

const mockLoginAuthDtoWithUsername: LoginAuthDto = {
  email: '',
  username: 'testuser',
  password: 'password123',
};

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedPassword',
};

const mockUserWithoutPassword = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
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
        MODE: 'develop',
      };
      return config[key];
    }),
  },
});

const createJwtServiceMock = () => ({
  provide: JwtService,
  useValue: {
    sign: jest.fn((_, options) => {
      const expiresIn = (options as { expiresIn?: string })?.expiresIn;
      return expiresIn === '15m' ? mockAccessToken : mockRefreshToken;
    }),
    verifyAsync: jest.fn(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
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
    configService = module.get<ConfigService>(ConfigService);

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
      prismaMock.user.create.mockResolvedValue(
        mockUserWithoutPassword as never,
      );

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
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateAuthDto.password,
        'salt',
      );
    });

    it('should log user creation message', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prismaMock.user.create.mockResolvedValue(
        mockUserWithoutPassword as never,
      );

      const loggerSpy = jest.spyOn(service['logger'], 'log');
      await service.signIn(mockResponse, mockCreateAuthDto);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Пользователь с ${mockUserWithoutPassword.id} создан`,
      );
    });
  });

  describe('login', () => {
    it('should throw ForbiddenException if user does not exist', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(
        service.login(mockResponse, mockLoginAuthDtoWithEmail),
      ).rejects.toThrow(ForbiddenException);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Пользователь не существует или неверный пароль',
      );
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(
        service.login(mockResponse, mockLoginAuthDtoWithEmail),
      ).rejects.toThrow(ForbiddenException);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Пользователь не существует или неверный пароль',
      );
    });

    it('should login user with email and return accessToken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(
        mockResponse,
        mockLoginAuthDtoWithEmail,
      );

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('should login user with username and return accessToken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(
        mockResponse,
        mockLoginAuthDtoWithUsername,
      );

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const mockPayload: JwtPayload = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };

    it('should throw UnauthorizedException if refreshToken is not present', async () => {
      const req = { cookies: {} } as unknown as Request;

      await expect(service.refresh(req, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refreshToken is empty string', async () => {
      const req = { cookies: { refreshToken: '' } } as unknown as Request;

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
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(req, mockResponse)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      const req = {
        cookies: { refreshToken: mockRefreshToken },
      } as unknown as Request;
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(
        mockUserWithoutPassword as never,
      );

      const result = await service.refresh(req, mockResponse);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.id },
        select: { id: true, email: true, username: true },
      });
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
          expires: new Date(0),
        }),
      );

      expect(result).toEqual({ logout: true });
    });

    it('should set secure cookie to false in dev mode', () => {
      jest.spyOn(configService, 'getOrThrow').mockReturnValue('develop');
      service.logout(mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refreshToken',
        expect.objectContaining({
          secure: false,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('genJWTtokens', () => {
    it('should generate access and refresh tokens with correct expiration', () => {
      const payload: JwtPayload = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      const result = service['genJWTtokens'](payload);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '15m',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
      });
    });
  });

  describe('sendCookie', () => {
    it('should set cookie with correct parameters', () => {
      const token = 'test-token';
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

      service['sendCookie'](mockResponse, token, expires);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        token,
        expect.objectContaining({
          httpOnly: true,
          expires,
        }),
      );
    });
  });

  describe('auth', () => {
    it('should generate tokens and set cookie with expiration', () => {
      const payload: JwtPayload = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = service['auth'](mockResponse, payload);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockRefreshToken,
        expect.objectContaining({
          expires: new Date(now + 7 * 24 * 60 * 60 * 1000),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find user by email or username', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);

      await service['findOne'](mockCreateAuthDto);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: {
                equals: mockCreateAuthDto.email,
                mode: 'insensitive',
              },
            },
            {
              username: {
                equals: mockCreateAuthDto.username,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    });

    it('should return null if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const result = await service['findOne'](mockCreateAuthDto);

      expect(result).toBeNull();
    });
  });
});
