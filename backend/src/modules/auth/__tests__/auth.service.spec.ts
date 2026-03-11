import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
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

interface MockUser {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockUserWithoutPassword {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  const prismaMock = createMockPrismaService();
  const responseMock = {
    cookie: jest.fn(),
  } as unknown as Response;

  const mockAccessToken = 'access-token';
  const mockRefreshToken = 'refresh-token';

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

  const mockUser: MockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: 'USER',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockUserWithoutPassword: MockUserWithoutPassword = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockPayload: JwtPayload = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeEach(async () => {
    const jwtServiceMock = {
      sign: jest.fn((_: object, options: { expiresIn?: string }) => {
        return options?.expiresIn === '15m'
          ? mockAccessToken
          : mockRefreshToken;
      }),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
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
        },
        { provide: JwtService, useValue: jwtServiceMock },
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
        service.signIn(responseMock, mockCreateAuthDto),
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

      const result = await service.signIn(responseMock, mockCreateAuthDto);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCreateAuthDto.email,
          password: 'hashedPassword',
          username: mockCreateAuthDto.username,
        },
        omit: { password: true },
      });

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(responseMock.cookie).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateAuthDto.password,
        'salt',
      );
    });
  });

  describe('login', () => {
    it('should throw ForbiddenException if user does not exist', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login(responseMock, mockLoginAuthDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(responseMock, mockLoginAuthDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should login user and return accessToken', async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(responseMock, mockLoginAuthDto);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(responseMock.cookie).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refreshToken is not present', async () => {
      const req = { cookies: {} } as unknown as Request;

      await expect(service.refresh(req, responseMock)).rejects.toThrow(
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

      await expect(service.refresh(req, responseMock)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const req = {
        cookies: { refreshToken: mockRefreshToken },
      } as unknown as Request;
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(req, responseMock)).rejects.toThrow(
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

      const result = await service.refresh(req, responseMock);

      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(responseMock.cookie).toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.id },
        select: { id: true, email: true, username: true },
      });
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie and return logout status', () => {
      const result = service.logout(responseMock);

      expect(responseMock.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          expires: new Date(0),
        }),
      );

      expect(result).toEqual({ logout: true });
    });
  });
});
