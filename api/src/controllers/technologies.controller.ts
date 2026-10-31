import type { Request, Response } from 'express';
import * as technologiesService from '../services/technologies.service';
import { successResponse } from '../utils/response';

export const listController = async (_req: Request, res: Response) => {
  res.json(successResponse(await technologiesService.list()));
};

export const getByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  res.json(successResponse(await technologiesService.getById(req.params.id)));
};

export const createController = async (req: Request, res: Response) => {
  const technology = await technologiesService.create(req.body);
  res.status(201).json(successResponse(technology, 'Technology created'));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const technology = await technologiesService.update(req.params.id, req.body);
  res.json(successResponse(technology, 'Technology updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await technologiesService.remove(req.params.id);
  res.json(successResponse(result, 'Technology deleted'));
};
