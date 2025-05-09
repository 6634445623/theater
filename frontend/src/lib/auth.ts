import Cookies from 'js-cookie';

export function getToken(): string | null {
  return Cookies.get('token') || null;
}

export function setToken(token: string): void {
  Cookies.set('token', token);
}

export function removeToken(): void {
  Cookies.remove('token');
}