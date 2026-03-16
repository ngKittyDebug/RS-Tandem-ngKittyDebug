interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  accessToken: string;
}

interface LogoutResponse {
  logout: boolean;
}

export type { AuthResponse, LogoutResponse, AuthTokens };
