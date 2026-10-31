import crypto from 'crypto';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiry,
  tokensMatch,
  verifyRefreshToken,
} from '../utils/jwt';
import { ApiError } from '../utils/errors';

const REFRESH_RACE_WINDOW_MS = 10_000;

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tokenVersion: number;
};

const publicUser = (user: SessionUser) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const tokenInput = (user: SessionUser) => ({
  userId: user.id,
  email: user.email,
  role: user.role,
  tv: user.tokenVersion,
});

const issueSession = async (user: SessionUser, familyId?: string) => {
  const sid = crypto.randomUUID();
  const payload = tokenInput(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ ...payload, sid });

  await prisma.refreshSession.create({
    data: {
      id: sid,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      familyId: familyId ?? sid,
      expiresAt: refreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
};

const revokeFamily = (familyId: string) =>
  prisma.refreshSession.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    user: publicUser(user),
    ...(await issueSession(user)),
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
  const payload = verifyRefreshToken(refreshToken);
  const session = await prisma.refreshSession.findUnique({
    where: { id: payload.sid! },
    include: { user: true },
  });

  if (
    !session ||
    session.userId !== payload.userId ||
    !tokensMatch(refreshToken, session.tokenHash)
  ) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  if (session.revokedAt) {
    const rotatedRecently =
      session.replacedBy &&
      Date.now() - session.revokedAt.getTime() < REFRESH_RACE_WINDOW_MS;

    if (rotatedRecently) {
      throw new ApiError(
        409,
        'Refresh token was just rotated. Retry with the latest token.'
      );
    }

    await revokeFamily(session.familyId);
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await revokeFamily(session.familyId);
    throw new ApiError(401, 'Refresh token has expired');
  }

  const user = session.user;

  if (user.tokenVersion !== payload.tv) {
    await revokeFamily(session.familyId);
    throw new ApiError(401, 'Session has been revoked');
  }

  const tokens = await prisma.$transaction(async (tx) => {
    const newSid = crypto.randomUUID();
    const nextPayload = tokenInput(user);
    const accessToken = generateAccessToken(nextPayload);
    const nextRefreshToken = generateRefreshToken({
      ...nextPayload,
      sid: newSid,
    });

    await tx.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedBy: newSid },
    });

    await tx.refreshSession.create({
      data: {
        id: newSid,
        userId: user.id,
        tokenHash: hashToken(nextRefreshToken),
        familyId: session.familyId,
        expiresAt: refreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken: nextRefreshToken };
  });

  return { user: publicUser(user), ...tokens };
};

export const logout = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.sid) {
      await prisma.refreshSession.updateMany({
        where: { id: payload.sid, userId: payload.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  } catch {
    // Best effort: an invalid/expired token is already unusable.
  }
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const password = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password, tokenVersion: { increment: 1 } },
    }),
    prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
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
