import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UserDto } from '../dto/update-user.dto';
import { UpdateUserPassword } from '../dto/update-user-pass.dto';
import { ConfirmPasswordDto } from '../dto/delete-user-account.dto';
import { AvatarUpdateDto } from '../dto/update-avatar.dto';
import { GameType } from 'src/generated/prisma/enums';

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: DeepMockProxy<UserService>;

  const mockUserId = 'user-123';

  const mockUserProfile = {
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    providerId: null,
    provider: 'local' as const,
    refreshToken: 'this...is...TOKEN',
  };

  const mockUpdateUserDto: UserDto = {
    username: 'newusername',
    email: 'newemail@example.com',
    password: 'CurrentPass123!',
  };

  const mockUpdatePasswordDto: UpdateUserPassword = {
    oldPassword: 'OldPass123!',
    newPassword: 'NewPass456!',
  };

  const mockAvatarUpdateDto: AvatarUpdateDto = {
    avatar: 'https://example.com/new-avatar.jpg',
  };

  const mockConfirmPasswordDto: ConfirmPasswordDto = {
    password: 'CurrentPass123!',
  };

  beforeEach(async () => {
    userServiceMock = mockDeep<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should call userService.getUserProfile with correct user id', async () => {
      userServiceMock.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.findOne(mockUserId);

      expect(userServiceMock.getUserProfile).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('updateUser', () => {
    it('should call userService.updateUser with correct parameters', async () => {
      const mockResult = {
        username: 'newusername',
        email: 'newemail@example.com',
      };
      userServiceMock.updateUser.mockResolvedValue(mockResult);

      const result = await controller.updateUser(mockUserId, mockUpdateUserDto);

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(
        mockUserId,
        mockUpdateUserDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserAvatar', () => {
    it('should call userService.updateUserAvatar with correct parameters', async () => {
      const mockResult = { avatar: mockAvatarUpdateDto.avatar };
      userServiceMock.updateUserAvatar.mockResolvedValue(mockResult);

      const result = await controller.updateUserAvatar(
        mockUserId,
        mockAvatarUpdateDto,
      );

      expect(userServiceMock.updateUserAvatar).toHaveBeenCalledWith(
        mockUserId,
        mockAvatarUpdateDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updatePassword', () => {
    it('should call userService.updatePassword with correct parameters', async () => {
      const mockResult = { success: true };
      userServiceMock.updatePassword.mockResolvedValue(mockResult);

      const result = await controller.updatePassword(
        mockUserId,
        mockUpdatePasswordDto,
      );

      expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
        mockUserId,
        mockUpdatePasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should call userService.deleteUser with correct parameters', async () => {
      const mockResult = { success: true };
      userServiceMock.deleteUser.mockResolvedValue(mockResult);

      const result = await controller.delete(
        mockUserId,
        mockConfirmPasswordDto,
      );

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(
        mockUserId,
        mockConfirmPasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserStat', () => {
    it('should call userService.updateUserGameStats with correct parameters', async () => {
      const mockGameType = GameType.mergeGame;
      const mockResult = {
        gameType: mockGameType,
        playedCount: 5,
        updatedAt: new Date('2024-01-01'),
      };
      userServiceMock.updateUserGameStats.mockResolvedValue(mockResult);

      const result = await controller.updateUserStat(mockUserId, mockGameType);

      expect(userServiceMock.updateUserGameStats).toHaveBeenCalledWith(
        mockUserId,
        mockGameType,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserGameStatsById', () => {
    it('should call userService.getUserGameStatsById with correct parameters', async () => {
      const mockGameType = GameType.mergeGame;
      const mockResult = {
        gameType: mockGameType,
        playedCount: 10,
        updatedAt: new Date('2024-01-01'),
      };
      userServiceMock.getUserGameStatsById.mockResolvedValue(mockResult);

      const result = await controller.getUserGameStatsById(
        mockUserId,
        mockGameType,
      );

      expect(userServiceMock.getUserGameStatsById).toHaveBeenCalledWith(
        mockUserId,
        mockGameType,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllUserGamesStats', () => {
    it('should call userService.getAllUserGamesStats with correct user id', async () => {
      const mockResult = [
        {
          gameType: GameType.mergeGame,
          playedCount: 10,
          updatedAt: new Date('2024-01-01'),
        },
        {
          gameType: GameType.decrypto,
          playedCount: 5,
          updatedAt: new Date('2024-01-02'),
        },
      ];
      userServiceMock.getAllUserGamesStats.mockResolvedValue(mockResult);

      const result = await controller.getAllUserGamesStats(mockUserId);

      expect(userServiceMock.getAllUserGamesStats).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
