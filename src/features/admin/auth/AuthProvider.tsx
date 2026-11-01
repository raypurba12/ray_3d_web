import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { request } from "../../../lib/api";
import {
  clearLegacyTokens,
  clearSession,
  getStoredUser,
  storeUser,
  UNAUTHORIZED_EVENT,
} from "../../../lib/auth-storage";
import type { AdminUser } from "../../../types/admin";
import { AuthContext } from "./auth-context";
import type { AuthContextValue, AuthStatus } from "./auth-context";

type LoginResponse = {
  user: AdminUser;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    clearLegacyTokens();

    let cancelled = false;

    request<AdminUser>("/auth/me")
      .then((me) => {
        if (cancelled) return;
        storeUser(me);
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    storeUser(data.user);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    void request("/auth/logout", {
      method: "POST",
      auth: false,
    }).catch(() => undefined);

    clearSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
