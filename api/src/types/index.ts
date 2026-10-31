import type { Request } from 'express';

export type TokenType = 'access' | 'refresh';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tv: number;
  type: TokenType;
  sid?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  tv: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
