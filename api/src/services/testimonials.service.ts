import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from '../schemas/testimonial.schema';

export const list = () =>
  prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

export const getById = async (id: string) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });

  if (!testimonial) {
    throw new ApiError(404, 'Testimonial not found');
  }

  return testimonial;
};

export const create = (input: CreateTestimonialInput) =>
  prisma.testimonial.create({ data: input });

export const update = (id: string, input: UpdateTestimonialInput) =>
  prisma.testimonial.update({ where: { id }, data: input });

export const remove = (id: string) =>
  prisma.testimonial.delete({ where: { id }, select: { id: true } });
