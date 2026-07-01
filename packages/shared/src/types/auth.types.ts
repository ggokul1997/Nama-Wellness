import { UserRole } from '../constants/roles';

export interface UserSessionDto {
  id: string;
  email: string;
  roles: UserRole[];
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSessionDto;
}
