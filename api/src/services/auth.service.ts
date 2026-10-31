import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { ApiError } from '../utils/errors';

const publicUser = (user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const signTokens = (user: { id: string; email: string; role: string }) => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    user: publicUser(user),
    ...signTokens(user),
  };
};

export const register = async (
  email: string,
  password: string,
  name: string
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await prisma.user.create({
    data: { email, password: await hashPassword(password), name },
  });

  return publicUser(user);
};

export const refresh = async (refreshToken: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  return {
    user: publicUser(user),
    ...signTokens(user),
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};
