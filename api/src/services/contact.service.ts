import type { MessageStatus } from '@prisma/client';
import prisma from '../config/database';
import type { CreateContactMessageInput } from '../schemas/contact.schema';

export const create = (input: CreateContactMessageInput) =>
  prisma.contactMessage.create({
    data: input,
    select: { id: true },
  });

export const list = (status?: MessageStatus) =>
  prisma.contactMessage.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

export const unreadCount = () =>
  prisma.contactMessage.count({ where: { status: 'NEW' } });

export const updateStatus = (id: string, status: MessageStatus) =>
  prisma.contactMessage.update({
    where: { id },
    data: { status, readAt: status === 'NEW' ? null : new Date() },
  });

export const remove = (id: string) =>
  prisma.contactMessage.delete({ where: { id }, select: { id: true } });
