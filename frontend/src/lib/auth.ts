import Cookies from 'js-cookie';

export function getToken(): string | null {
  return Cookies.get('token') || null;
}

export function setToken(token: string): void {
  console.log('Setting token in cookie. Token value:', token);
  console.log('Token type:', typeof token);
  console.log('Token length:', token.length);
  Cookies.set('token', token, {
    expires: 1, // 1 day to match backend's 24h expiration
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
}

export function removeToken(): void {
  Cookies.remove('token', {
    path: '/'
  });
}