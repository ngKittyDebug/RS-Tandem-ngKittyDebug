import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { Request } from 'express';
import { UserDto } from '../dto/update-user.dto';
import { UpdateUserPassword } from '../dto/update-user-pass';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

interface UserPayload {
  id: string;
  email: string;
  username: string;
}

interface FindOneResponse {
  email: string;
  username: string;
  createdAt: Date;
}

interface UpdateUserResponse {
  email: string;
  username: string;
}

const createRequestMock = (): Request =>
  ({
    user: {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    } as UserPayload,
  }) as unknown as Request;

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: DeepMockProxy<UserService>;

  const mockUserDto: UserDto = {
    email: 'newemail@example.com',
    username: 'newusername',
    password: 'password123',
  };

  const mockUpdatePasswordDto: UpdateUserPassword = {
    oldPassword: 'oldPassword123',
    newPassword: 'newPassword123',
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
    it('should return user data', async () => {
      const mockResult: FindOneResponse = {
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      userServiceMock.findOne.mockResolvedValue(mockResult);

      const req = createRequestMock();
      const result = await controller.findOne(req);

      expect(userServiceMock.findOne).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUser', () => {
    it('should update user and return result', async () => {
      const mockResult: UpdateUserResponse = {
        email: 'newemail@example.com',
        username: 'newusername',
      };
      userServiceMock.updateUser.mockResolvedValue(mockResult);

      const req = createRequestMock();
      const result = await controller.updateUser(req, mockUserDto);

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(req, mockUserDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updatePassword', () => {
    it('should update password and return result', async () => {
      const mockResult = { success: true };
      userServiceMock.updatePassword.mockResolvedValue(mockResult);

      const req = createRequestMock();
      const result = await controller.updatePassword(
        req,
        mockUpdatePasswordDto,
      );

      expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
        req,
        mockUpdatePasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete user and return result', async () => {
      const mockResult = { success: true };
      userServiceMock.deleteUser.mockResolvedValue(mockResult);

      const req = createRequestMock();
      const result = await controller.delete(req, mockUserDto);

      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(req, mockUserDto);
      expect(result).toEqual(mockResult);
    });
  });
});
