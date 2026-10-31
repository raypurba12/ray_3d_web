import type { Request, Response } from 'express';
import type { MessageStatus } from '@prisma/client';
import * as contactService from '../services/contact.service';
import { successResponse } from '../utils/response';

const STATUSES: MessageStatus[] = ['NEW', 'READ', 'ARCHIVED'];

const parseStatus = (value: unknown): MessageStatus | undefined =>
  typeof value === 'string' && STATUSES.includes(value as MessageStatus)
    ? (value as MessageStatus)
    : undefined;

export const createController = async (req: Request, res: Response) => {
  const message = await contactService.create(req.body);
  res.status(201).json(successResponse(message, 'Message received'));
};

export const listController = async (req: Request, res: Response) => {
  res.json(
    successResponse(await contactService.list(parseStatus(req.query.status)))
  );
};

export const unreadCountController = async (_req: Request, res: Response) => {
  res.json(successResponse({ count: await contactService.unreadCount() }));
};

export const updateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const message = await contactService.updateStatus(
    req.params.id,
    req.body.status
  );
  res.json(successResponse(message, 'Message updated'));
};

export const deleteController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const result = await contactService.remove(req.params.id);
  res.json(successResponse(result, 'Message deleted'));
};
