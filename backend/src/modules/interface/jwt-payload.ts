import { Provider, Role } from 'src/generated/prisma/enums';

export interface JwtPayload {
  id: string;
  username?: string;
  email?: string;
  provider?: Provider;
  role?: Role;
}
