export const AUTH_PATHS = {
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  GITHUB: '/github',
} as const;

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS];
