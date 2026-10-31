import type { Request, Response } from 'express';
import * as testimonialsService from '../services/testimonials.service';
import { successResponse } from '../utils/response';

export const listController = async (_req: Request, res: Response) => {
  res.json(successResponse(await testimonialsService.list()));
};

export const getByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  res.json(successResponse(await testimonialsService.getById(req.params.id)));
};

export const createController = async (req: Request, res: Response) => {
  const testimonial = await testimonialsService.create(req.body);
  res.status(201).json(successResponse(testimonial, 'Testimonial created'));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const testimonial = await testimonialsService.update(req.params.id, req.body);
  res.json(successResponse(testimonial, 'Testimonial updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await testimonialsService.remove(req.params.id);
  res.json(successResponse(result, 'Testimonial deleted'));
};
