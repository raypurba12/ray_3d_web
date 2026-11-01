import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import type { SiteContentInput } from '../schemas/site-content.schema';

const SITE_CONTENT_KEY = 'site_content';

export const get = async () => {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SITE_CONTENT_KEY },
  });

  return row?.value ?? {};
};

export const update = async (input: SiteContentInput) => {
  const value = input as unknown as Prisma.InputJsonValue;

  const row = await prisma.siteSetting.upsert({
    where: { key: SITE_CONTENT_KEY },
    create: { key: SITE_CONTENT_KEY, value },
    update: { value },
  });

  return row.value;
};
