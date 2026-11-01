import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response';
import {
  clearAuthCookies,
  readCookie,
  REFRESH_COOKIE,
  setAuthCookies,
} from '../utils/cookies';
import type { AuthRequest } from '../types';
import { ApiError } from '../utils/errors';

const refreshTokenFromRequest = (req: Request): string | undefined => {
  const cookie = readCookie(req, REFRESH_COOKIE);
  if (cookie) return cookie;

  const body = req.body as { refreshToken?: unknown } | undefined;
  return typeof body?.refreshToken === 'string' && body.refreshToken
    ? body.refreshToken
    : undefined;
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password
  );

  setAuthCookies(res, accessToken, refreshToken);
  res.json(successResponse({ user }, 'Login successful'));
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await authService.register(email, password, name);
  res.status(201).json(successResponse(user, 'User created successfully'));
};

export const refreshController = async (req: Request, res: Response) => {
  const token = refreshTokenFromRequest(req);
  if (!token) {
    clearAuthCookies(res);
    throw new ApiError(401, 'Session expired');
  }

  const result = await authService.refresh(token);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json(successResponse({ user: result.user }, 'Token refreshed'));
};

export const logoutController = async (req: Request, res: Response) => {
  const token = refreshTokenFromRequest(req);
  if (token) {
    await authService.logout(token);
  }

  clearAuthCookies(res);
  res.json(successResponse(null, 'Logged out'));
};

export const changePasswordController = async (
  req: AuthRequest,
  res: Response
) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(
    req.user!.userId,
    currentPassword,
    newPassword
  );

  clearAuthCookies(res);
  res.json(
    successResponse(null, 'Password updated. Please sign in again.')
  );
};

export const getMeController = async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json(successResponse(user));
};
