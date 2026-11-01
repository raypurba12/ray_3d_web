import type { AdminUser } from "../types/admin";

const USER_KEY = "rp_user";
const LEGACY_ACCESS_KEY = "rp_access_token";
const LEGACY_REFRESH_KEY = "rp_refresh_token";

export const UNAUTHORIZED_EVENT = "admin:unauthorized";

export const getStoredUser = (): AdminUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
};

export const storeUser = (user: AdminUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  clearLegacyTokens();
};

export const clearLegacyTokens = () => {
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
  clearLegacyTokens();
};

export const notifyUnauthorized = () => {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
};
