export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export function saveAuthSession(accessToken: string, refreshToken: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nama_access_token', accessToken);
  localStorage.setItem('nama_refresh_token', refreshToken);
  localStorage.setItem('nama_user', JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('nama_access_token');
  localStorage.removeItem('nama_refresh_token');
  localStorage.removeItem('nama_user');
}

export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('nama_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nama_access_token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getRedirectPath(user: User): string {
  if (user.roles.includes('admin')) {
    return '/admin/applications';
  }
  if (user.roles.includes('company_admin')) {
    return '/corporate/admin';
  }
  if (user.roles.includes('teacher')) {
    return '/teacher/dashboard';
  }
  return '/student/dashboard';
}
