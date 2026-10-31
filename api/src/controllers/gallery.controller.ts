import type { Request, Response } from 'express';
import * as galleryService from '../services/gallery.service';
import { successResponse } from '../utils/response';

export const listController = async (_req: Request, res: Response) => {
  res.json(successResponse(await galleryService.list()));
};

export const getByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  res.json(successResponse(await galleryService.getById(req.params.id)));
};

export const createController = async (req: Request, res: Response) => {
  const image = await galleryService.create(req.body);
  res.status(201).json(successResponse(image, 'Gallery image created'));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const image = await galleryService.update(req.params.id, req.body);
  res.json(successResponse(image, 'Gallery image updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await galleryService.remove(req.params.id);
  res.json(successResponse(result, 'Gallery image deleted'));
};
