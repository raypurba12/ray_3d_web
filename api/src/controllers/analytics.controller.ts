import type { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';
import { successResponse } from '../utils/response';

const ALLOWED_RANGES = new Set([7, 14, 30]);

export const trackPageViewController = async (req: Request, res: Response) => {
  await analyticsService.trackPageView(req.body);
  res.status(201).json(successResponse({ recorded: true }));
};

export const trackCvDownloadController = async (
  req: Request,
  res: Response
) => {
  await analyticsService.trackCvDownload(req.body);
  res.status(201).json(successResponse({ recorded: true }));
};

export const summaryController = async (req: Request, res: Response) => {
  const days = Number(req.query.days);
  const range = ALLOWED_RANGES.has(days) ? days : 14;

  res.json(successResponse(await analyticsService.summary(range)));
};
