import jwt, { type SignOptions } from 'jsonwebtoken';
import { ApiError } from './errors';
import type { JWTPayload } from '../types';

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(500, `${name} is not configured`);
  }
  return value;
};

const expiresIn = (name: string, fallback: string): SignOptions['expiresIn'] =>
  (process.env[name] || fallback) as SignOptions['expiresIn'];

export const generateAccessToken = (payload: JWTPayload): string =>
  jwt.sign(payload, getRequiredEnv('JWT_SECRET'), {
    expiresIn: expiresIn('JWT_EXPIRE', '7d'),
  });

export const generateRefreshToken = (payload: JWTPayload): string =>
  jwt.sign(payload, getRequiredEnv('JWT_REFRESH_SECRET'), {
    expiresIn: expiresIn('JWT_REFRESH_EXPIRE', '30d'),
  });

export const verifyAccessToken = (token: string): JWTPayload =>
  jwt.verify(token, getRequiredEnv('JWT_SECRET')) as JWTPayload;

export const verifyRefreshToken = (token: string): JWTPayload =>
  jwt.verify(token, getRequiredEnv('JWT_REFRESH_SECRET')) as JWTPayload;
