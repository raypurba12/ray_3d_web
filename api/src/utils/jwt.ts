import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './errors';
import type { JWTPayload, TokenType } from '../types';

type TokenInput = {
  userId: string;
  email: string;
  role: string;
  tv: number;
};

const accessExpiresIn = env.JWT_EXPIRE as SignOptions['expiresIn'];
const refreshExpiresIn = env.JWT_REFRESH_EXPIRE as SignOptions['expiresIn'];

export const generateAccessToken = (payload: TokenInput): string =>
  jwt.sign({ ...payload, type: 'access' satisfies TokenType }, env.JWT_SECRET, {
    expiresIn: accessExpiresIn,
  });

export const generateRefreshToken = (
  payload: TokenInput & { sid: string }
): string =>
  jwt.sign(
    { ...payload, type: 'refresh' satisfies TokenType },
    env.JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiresIn }
  );

const verify = (token: string, secret: string, type: TokenType): JWTPayload => {
  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, secret);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  if (
    typeof decoded === 'string' ||
    decoded.type !== type ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string' ||
    typeof decoded.role !== 'string' ||
    typeof decoded.tv !== 'number'
  ) {
    throw new ApiError(401, 'Invalid token');
  }

  if (type === 'refresh' && typeof decoded.sid !== 'string') {
    throw new ApiError(401, 'Invalid refresh token');
  }

  return decoded as JWTPayload;
};

export const verifyAccessToken = (token: string): JWTPayload =>
  verify(token, env.JWT_SECRET, 'access');

export const verifyRefreshToken = (token: string): JWTPayload =>
  verify(token, env.JWT_REFRESH_SECRET, 'refresh');

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const tokensMatch = (token: string, storedHash: string): boolean => {
  const digest = Buffer.from(hashToken(token), 'utf8');
  const expected = Buffer.from(storedHash, 'utf8');
  return (
    digest.length === expected.length && crypto.timingSafeEqual(digest, expected)
  );
};

const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export const refreshTokenExpiry = (): Date => {
  const match = /^(\d+)([smhd])$/.exec(env.JWT_REFRESH_EXPIRE);
  const durationMs = match
    ? Number(match[1]) * UNIT_MS[match[2]]
    : 30 * UNIT_MS.d;

  return new Date(Date.now() + durationMs);
};
