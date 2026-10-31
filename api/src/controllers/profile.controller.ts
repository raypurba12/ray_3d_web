import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { successResponse } from '../utils/response';

export const getController = async (_req: Request, res: Response) => {
  res.json(successResponse(await profileService.get()));
};

export const updateController = async (req: Request, res: Response) => {
  const profile = await profileService.update(req.body);
  res.json(successResponse(profile, 'Profile updated'));
};
