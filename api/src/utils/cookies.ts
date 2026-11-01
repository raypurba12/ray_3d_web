import type { CookieOptions, Request, Response } from 'express';
import { isProduction } from '../config/env';
import { accessTokenExpiryMs, refreshTokenExpiryMs } from './jwt';

export const ACCESS_COOKIE = 'rp_access';
export const REFRESH_COOKIE = 'rp_refresh';

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/api',
};

const refreshOptions: CookieOptions = {
  ...baseOptions,
  path: '/api/auth',
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: accessTokenExpiryMs(),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshOptions,
    maxAge: refreshTokenExpiryMs(),
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_COOKIE, baseOptions);
  res.clearCookie(REFRESH_COOKIE, refreshOptions);
};

export const readCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    if (part.slice(0, separator).trim() === name) {
      const value = part.slice(separator + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return undefined;
};
