import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import type { UpdateProfileInput } from '../schemas/profile.schema';

const PROFILE_ID = 'profile';

export const get = async () => {
  const profile = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });

  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }

  return profile;
};

export const update = async (input: UpdateProfileInput) => {
  const existing = await prisma.profile.findUnique({
    where: { id: PROFILE_ID },
  });

  if (existing) {
    return prisma.profile.update({ where: { id: PROFILE_ID }, data: input });
  }

  const requiredFields = ['name', 'tagline', 'bio', 'avatar', 'email'] as const;
  const missing = requiredFields.filter((field) => !input[field]);

  if (missing.length > 0) {
    throw new ApiError(
      400,
      `Profile does not exist yet. Required fields to create it: ${missing.join(', ')}`
    );
  }

  return prisma.profile.create({
    data: {
      id: PROFILE_ID,
      name: input.name as string,
      tagline: input.tagline as string,
      bio: input.bio as string,
      avatar: input.avatar as string,
      email: input.email as string,
      resumeUrl: input.resumeUrl,
      phone: input.phone,
      location: input.location,
      github: input.github,
      linkedin: input.linkedin,
      twitter: input.twitter,
      website: input.website,
    },
  });
};
