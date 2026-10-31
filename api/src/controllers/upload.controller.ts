import type { Request, Response } from 'express';
import {
  deleteLocalImage,
  storeImage,
  type StoredImage,
} from '../services/upload.service';
import { ApiError } from '../utils/errors';
import { successResponse } from '../utils/response';

const withAbsoluteUrl = (req: Request, stored: StoredImage) => ({
  ...stored,
  url: stored.path.startsWith('http')
    ? stored.path
    : `${req.protocol}://${req.get('host')}${stored.path}`,
});

export const uploadSingleController = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'File is required (field name: file)');
  }

  const stored = await storeImage(req.file);
  res.status(201).json(successResponse(withAbsoluteUrl(req, stored), 'File uploaded'));
};

export const uploadMultipleController = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    throw new ApiError(400, 'At least one file is required (field name: files)');
  }

  const stored = await Promise.all(files.map((file) => storeImage(file)));
  res
    .status(201)
    .json(successResponse(stored.map((item) => withAbsoluteUrl(req, item)), 'Files uploaded'));
};

export const deleteController = async (
  req: Request<{ filename: string }>,
  res: Response
) => {
  const result = await deleteLocalImage(req.params.filename);
  res.json(successResponse(result, 'File deleted'));
};
