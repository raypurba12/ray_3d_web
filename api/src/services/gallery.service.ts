import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import type {
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
} from '../schemas/gallery.schema';

export const list = () =>
  prisma.galleryImage.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

export const getById = async (id: string) => {
  const image = await prisma.galleryImage.findUnique({ where: { id } });

  if (!image) {
    throw new ApiError(404, 'Gallery image not found');
  }

  return image;
};

export const create = (input: CreateGalleryImageInput) =>
  prisma.galleryImage.create({ data: input });

export const update = (id: string, input: UpdateGalleryImageInput) =>
  prisma.galleryImage.update({ where: { id }, data: input });

export const remove = (id: string) =>
  prisma.galleryImage.delete({ where: { id }, select: { id: true } });
