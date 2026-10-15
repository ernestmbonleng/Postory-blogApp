import Cookies from 'js-cookie';

const TOKEN_KEY = 'accessToken';

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { 
    expires: 7, 
    path: '/', 
    sameSite: 'lax', 
    secure: process.env.NODE_ENV === 'production' 
  });
}

export function clearToken() {
  Cookies.remove(TOKEN_KEY, { path: '/' });
}