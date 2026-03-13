interface LoginByEmail {
  email: string;
  password: string;
}

interface LoginByUsername {
  username: string;
  password: string;
}

export type LoginDto = LoginByEmail | LoginByUsername;

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
