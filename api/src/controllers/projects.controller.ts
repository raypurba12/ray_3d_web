import type { Request, Response } from 'express';
import * as projectsService from '../services/projects.service';
import { storeImage } from '../services/upload.service';
import { ApiError } from '../utils/errors';
import { successResponse } from '../utils/response';

export const listController = async (_req: Request, res: Response) => {
  res.json(successResponse(await projectsService.list()));
};

export const getByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  res.json(successResponse(await projectsService.getById(req.params.id)));
};

export const createController = async (req: Request, res: Response) => {
  const project = await projectsService.create(req.body);
  res.status(201).json(successResponse(project, 'Project created'));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const project = await projectsService.update(req.params.id, req.body);
  res.json(successResponse(project, 'Project updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await projectsService.remove(req.params.id);
  res.json(successResponse(result, 'Project deleted'));
};

export const uploadImageController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required (field name: image)');
  }

  const stored = await storeImage(req.file);
  const project = await projectsService.updateImage(req.params.id, stored.path);

  res.json(
    successResponse({ project, upload: stored }, 'Project image updated')
  );
};
