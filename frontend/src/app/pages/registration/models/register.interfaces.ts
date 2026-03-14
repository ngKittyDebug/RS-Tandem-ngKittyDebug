export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
}
