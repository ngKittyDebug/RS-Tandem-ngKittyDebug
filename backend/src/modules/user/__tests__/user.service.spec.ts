import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from '../dto/update-user.dto';
import { UpdateUserPassword } from '../dto/update-user-pass.dto';
import { ConfirmPasswordDto } from '../dto/delete-user-account.dto';
import { AvatarUpdateDto } from '../dto/update-avatar.dto';
import { Provider, Prisma } from 'src/generated/prisma/client';
import * as bcrypt from 'bcrypt-ts';

jest.mock('bcrypt-ts', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  const prismaMock = createMockPrismaService();

  const mockUserId = 'user-123';
  const mockPassword = 'hashedPassword123';
  const mockProvider = 'local';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    password: mockPassword,
    avatar: 'https://example.com/avatar.jpg',
    provider: Provider.local,
    providerId: null,
    role: 'USER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserProfile = {
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    providerId: null,
    provider: Provider.local,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(() => '10'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile without sensitive data', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUserProfile as never);

      const result = await service.getUserProfile(mockUserId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        omit: {
          password: true,
          updatedAt: true,
          role: true,
          id: true,
        },
      });
      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('updateUser', () => {
    const mockUpdateDto: UserDto = {
      username: 'newusername',
      email: 'newemail@example.com',
      password: 'CurrentPass123!',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUser(mockUserId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateUser(mockUserId, mockUpdateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update user and return updated data', async () => {
      const mockUpdatedUser = {
        username: mockUpdateDto.username,
        email: mockUpdateDto.email,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue(mockUpdatedUser as never);

      const result = await service.updateUser(mockUserId, mockUpdateDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { username: mockUpdateDto.username, email: mockUpdateDto.email },
        select: {
          username: true,
          email: true,
        },
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw ConflictException if username or email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '5.0.0' },
      );
      prismaMock.user.update.mockRejectedValue(prismaError);

      await expect(
        service.updateUser(mockUserId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updatePassword', () => {
    const mockUpdatePasswordDto: UpdateUserPassword = {
      oldPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePassword(mockUserId, mockUpdatePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if old password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        password: mockPassword,
      } as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(mockUserId, mockUpdatePasswordDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update password and return success', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        password: mockPassword,
        provider: mockProvider,
      } as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      prismaMock.user.update.mockResolvedValue({} as never);

      const result = await service.updatePassword(
        mockUserId,
        mockUpdatePasswordDto,
      );

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: 'newHashedPassword' },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateUserAvatar', () => {
    const mockAvatarDto: AvatarUpdateDto = {
      avatar: 'https://example.com/new-avatar.jpg',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserAvatar(mockUserId, mockAvatarDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update avatar and return updated avatar', async () => {
      const mockUpdatedAvatar = { avatar: mockAvatarDto.avatar };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as never);
      prismaMock.user.update.mockResolvedValue(mockUpdatedAvatar as never);

      const result = await service.updateUserAvatar(mockUserId, mockAvatarDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { avatar: mockAvatarDto.avatar },
        select: { avatar: true },
      });
      expect(result).toEqual(mockUpdatedAvatar);
    });
  });

  describe('deleteUser', () => {
    const mockConfirmPasswordDto: ConfirmPasswordDto = {
      password: 'CurrentPass123!',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteUser(mockUserId, mockConfirmPasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for Github provider', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        password: mockPassword,
        provider: Provider.Github,
      } as never);

      await expect(
        service.deleteUser(mockUserId, mockConfirmPasswordDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        password: mockPassword,
        provider: Provider.local,
      } as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteUser(mockUserId, mockConfirmPasswordDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete user and return success', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUserId,
        password: mockPassword,
        provider: Provider.local,
      } as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.delete.mockResolvedValue({} as never);

      const result = await service.deleteUser(
        mockUserId,
        mockConfirmPasswordDto,
      );

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
