import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response';
import type { AuthRequest } from '../types';

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(successResponse(result, 'Login successful'));
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await authService.register(email, password, name);
  res.status(201).json(successResponse(user, 'User created successfully'));
};

export const refreshController = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json(successResponse(result, 'Token refreshed'));
};

export const getMeController = async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json(successResponse(user));
};
