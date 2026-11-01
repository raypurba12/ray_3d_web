import type { Request, Response } from 'express';
import * as siteContentService from '../services/site-content.service';
import { successResponse } from '../utils/response';

export const getController = async (_req: Request, res: Response) => {
  res.json(successResponse(await siteContentService.get()));
};

export const updateController = async (req: Request, res: Response) => {
  const content = await siteContentService.update(req.body);
  res.json(successResponse(content, 'Site content updated'));
};
