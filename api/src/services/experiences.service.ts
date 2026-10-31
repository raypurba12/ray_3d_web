import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import type {
  CreateExperienceInput,
  UpdateExperienceInput,
} from '../schemas/experience.schema';

const experienceInclude = {
  technologies: { orderBy: { order: 'asc' } },
} satisfies Prisma.ExperienceInclude;

export const list = () =>
  prisma.experience.findMany({
    include: experienceInclude,
    orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
  });

export const getById = async (id: string) => {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: experienceInclude,
  });

  if (!experience) {
    throw new ApiError(404, 'Experience not found');
  }

  return experience;
};

export const create = (input: CreateExperienceInput) => {
  const { technologies, ...data } = input;

  return prisma.experience.create({
    data: {
      ...data,
      ...(technologies?.length
        ? { technologies: { connect: technologies.map((id) => ({ id })) } }
        : {}),
    },
    include: experienceInclude,
  });
};

export const update = (id: string, input: UpdateExperienceInput) => {
  const { technologies, ...data } = input;

  return prisma.experience.update({
    where: { id },
    data: {
      ...data,
      ...(technologies !== undefined
        ? { technologies: { set: technologies.map((techId) => ({ id: techId })) } }
        : {}),
    },
    include: experienceInclude,
  });
};

export const remove = (id: string) =>
  prisma.experience.delete({ where: { id }, select: { id: true } });
