import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../../interface/jwt-payload';
import { UserDto } from '../dto/update-user.dto';
import { UpdateUserPassword } from '../dto/update-user-pass';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import * as bcrypt from 'bcrypt-ts';

jest.mock('bcrypt-ts', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedPassword',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  role: 'USER',
};

const mockUserWithoutSensitiveData = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

const mockUserUpdateResult = {
  email: 'newemail@example.com',
  username: 'newusername',
};

const createRequestMock = (payload: JwtPayload): Request =>
  ({
    user: payload,
  }) as unknown as Request;

const createConfigServiceMock = () => ({
  provide: ConfigService,
  useValue: {
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string | number> = {
        BCRYPT_SALT: 10,
      };
      return config[key];
    }),
  },
});

describe('UserService', () => {
  let service: UserService;
  const prismaMock = createMockPrismaService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
        createConfigServiceMock(),
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const mockPayload: JwtPayload = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };

    it('should return user data without sensitive fields', async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        mockUserWithoutSensitiveData as never,
      );

      const req = createRequestMock(mockPayload);
      const result = await service.findOne(req);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.id },
        omit: { password: true, updatedAt: true, role: true, id: true },
      });
      expect(result).toEqual(mockUserWithoutSensitiveData);
    });

    it('should return null if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = createRequestMock(mockPayload);
      const result = await service.findOne(req);

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    const mockPayload: JwtPayload = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };

    const mockDeleteDto: UserDto = { password: 'password123' };

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const req = createRequestMock(mockPayload);

      await expect(service.deleteUser(req, mockDeleteDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException with invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const req = createRequestMock(mockPayload);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.deleteUser(req, mockDeleteDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Пользователь не существует или неверный пароль',
      );
    });

    it('should delete user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.delete.mockResolvedValue(mockUser as never);
      const req = createRequestMock(mockPayload);

      const result = await service.deleteUser(req, mockDeleteDto);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateUser', () => {
    const mockPayload: JwtPayload = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };

    const mockUpdateDto: UserDto = {
      email: 'newemail@example.com',
      username: 'newusername',
      password: 'password123',
    };

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const req = createRequestMock(mockPayload);

      await expect(service.updateUser(req, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException with invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const req = createRequestMock(mockPayload);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.updateUser(req, mockUpdateDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Пользователь не существует или неверный пароль',
      );
    });

    it('should throw ConflictException if email or username already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findFirst.mockResolvedValue(mockUser as never);
      const req = createRequestMock(mockPayload);

      await expect(service.updateUser(req, mockUpdateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update user successfully with full data', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue(mockUserUpdateResult as never);
      const req = createRequestMock(mockPayload);

      const result = await service.updateUser(req, mockUpdateDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { username: mockUpdateDto.username, email: mockUpdateDto.email },
        select: { email: true, username: true },
      });
      expect(result).toEqual(mockUserUpdateResult);
    });

    it('should update user with partial data (email or username only)', async () => {
      const partialDto: UserDto = {
        email: 'new@example.com',
        password: 'pass123',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue({
        email: 'new@example.com',
        username: mockUser.username,
      } as never);
      const req = createRequestMock(mockPayload);

      await service.updateUser(req, partialDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { username: undefined, email: partialDto.email },
        select: { email: true, username: true },
      });
    });
  });

  describe('updatePassword', () => {
    const mockPayload: JwtPayload = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };

    const mockPasswordDto: UpdateUserPassword = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };

    const mockUserWithPassword = { id: '1', password: 'hashedOldPassword' };

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const req = createRequestMock(mockPayload);

      await expect(
        service.updatePassword(req, mockPasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException with invalid old password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        mockUserWithPassword as never,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const req = createRequestMock(mockPayload);
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await expect(
        service.updatePassword(req, mockPasswordDto),
      ).rejects.toThrow(ForbiddenException);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Пользователь не существует или неверный пароль',
      );
    });

    it('should update password successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        mockUserWithPassword as never,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      prismaMock.user.update.mockResolvedValue(mockUserWithPassword as never);
      const req = createRequestMock(mockPayload);

      const result = await service.updatePassword(req, mockPasswordDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUserWithPassword.id },
        data: { password: 'hashedNewPassword' },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
