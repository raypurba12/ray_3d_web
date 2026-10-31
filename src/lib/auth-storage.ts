import type { AdminUser } from "../types/admin";

const ACCESS_TOKEN_KEY = "rp_access_token";
const REFRESH_TOKEN_KEY = "rp_refresh_token";
const USER_KEY = "rp_user";

export const UNAUTHORIZED_EVENT = "admin:unauthorized";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredUser = (): AdminUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
};

export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const storeSession = (
  user: AdminUser,
  accessToken: string,
  refreshToken: string
) => {
  storeTokens(accessToken, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const notifyUnauthorized = () => {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
};
