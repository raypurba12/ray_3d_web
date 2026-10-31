import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import type {
  CreateTechnologyInput,
  UpdateTechnologyInput,
} from '../schemas/technology.schema';

export const list = () =>
  prisma.technology.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

export const getById = async (id: string) => {
  const technology = await prisma.technology.findUnique({ where: { id } });

  if (!technology) {
    throw new ApiError(404, 'Technology not found');
  }

  return technology;
};

export const create = (input: CreateTechnologyInput) =>
  prisma.technology.create({ data: input });

export const update = (id: string, input: UpdateTechnologyInput) =>
  prisma.technology.update({ where: { id }, data: input });

export const remove = (id: string) =>
  prisma.technology.delete({ where: { id }, select: { id: true } });
