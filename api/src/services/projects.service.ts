import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import { slugify } from '../utils/slug';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../schemas/project.schema';

const projectInclude = {
  tags: { orderBy: { name: 'asc' } },
  technologies: { orderBy: { order: 'asc' } },
  images: { orderBy: { order: 'asc' } },
} satisfies Prisma.ProjectInclude;

type ProjectImageInput = { image: string; caption?: string | null };

const toImageCreates = (images: ProjectImageInput[]) =>
  images.map((image, index) => ({
    image: image.image,
    caption: image.caption ?? null,
    order: index,
  }));

const resolveTagIds = async (names: string[]): Promise<string[]> => {
  const uniqueNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];

  const tags = await Promise.all(
    uniqueNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );

  return tags.map((tag) => tag.id);
};

export const list = () =>
  prisma.project.findMany({
    include: projectInclude,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

export const getById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

export const create = async (input: CreateProjectInput) => {
  const { technologies, tags, images, ...data } = input;
  const tagIds = tags ? await resolveTagIds(tags) : [];

  return prisma.project.create({
    data: {
      ...data,
      ...(technologies?.length
        ? { technologies: { connect: technologies.map((id) => ({ id })) } }
        : {}),
      ...(tagIds.length
        ? { tags: { connect: tagIds.map((id) => ({ id })) } }
        : {}),
      ...(images?.length ? { images: { create: toImageCreates(images) } } : {}),
    },
    include: projectInclude,
  });
};

export const update = async (id: string, input: UpdateProjectInput) => {
  const { technologies, tags, images, ...data } = input;
  const tagIds = tags ? await resolveTagIds(tags) : undefined;

  const relationData: Prisma.ProjectUpdateInput = {
    ...data,
    ...(technologies !== undefined
      ? { technologies: { set: technologies.map((techId) => ({ id: techId })) } }
      : {}),
    ...(tagIds !== undefined
      ? { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } }
      : {}),
  };

  if (images === undefined) {
    return prisma.project.update({
      where: { id },
      data: relationData,
      include: projectInclude,
    });
  }

  return prisma.$transaction(async (tx) => {
    await tx.projectImage.deleteMany({ where: { projectId: id } });

    return tx.project.update({
      where: { id },
      data: {
        ...relationData,
        ...(images.length
          ? { images: { create: toImageCreates(images) } }
          : {}),
      },
      include: projectInclude,
    });
  });
};

export const updateImage = (id: string, image: string) =>
  prisma.project.update({
    where: { id },
    data: { image },
    include: projectInclude,
  });

export const remove = (id: string) =>
  prisma.project.delete({ where: { id }, select: { id: true } });
