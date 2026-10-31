import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";

import { config } from "../../constants/config";
import { useAuth } from "../../features/admin/auth/useAuth";
import {
  buttonPrimary,
  inputClass,
  labelClass,
  panelClass,
} from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";

const loginErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Email atau password salah.";
    if (error.status === 429)
      return "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.";
    return error.message;
  }
  return "Login gagal. Coba lagi.";
};

const AdminLoginPage = () => {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  useEffect(() => {
    document.title = "Admin Login — Ray Purba";
    return () => {
      document.title = config.html.title;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-acid" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-primary px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.1),transparent_55%)]" />

      <div className={`relative w-full max-w-md ${panelClass} p-8`}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-acid/30 bg-acid/10 text-acid">
            <Lock size={20} />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Access</h1>
          <p className="mt-2 text-sm text-secondary">
            Masuk untuk mengelola konten portfolio.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@raypurba.com"
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={submitting}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className={`${buttonPrimary} w-full`}
            disabled={submitting}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
