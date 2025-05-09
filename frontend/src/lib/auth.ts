import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

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

interface User {
  is_admin: boolean;
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setIsAdmin(decoded.is_admin);
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, []);

  return {
    isAdmin,
    isLoading
  };
}