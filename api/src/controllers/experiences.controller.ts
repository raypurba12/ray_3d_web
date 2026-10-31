import type { Request, Response } from 'express';
import * as experiencesService from '../services/experiences.service';
import { successResponse } from '../utils/response';

export const listController = async (_req: Request, res: Response) => {
  res.json(successResponse(await experiencesService.list()));
};

export const getByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  res.json(successResponse(await experiencesService.getById(req.params.id)));
};

export const createController = async (req: Request, res: Response) => {
  const experience = await experiencesService.create(req.body);
  res.status(201).json(successResponse(experience, 'Experience created'));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const experience = await experiencesService.update(req.params.id, req.body);
  res.json(successResponse(experience, 'Experience updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await experiencesService.remove(req.params.id);
  res.json(successResponse(result, 'Experience deleted'));
};
