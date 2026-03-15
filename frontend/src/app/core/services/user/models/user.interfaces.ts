export interface User {
  username: string;
  email: string;
  createdAt: string;
}
export interface UpdateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}
