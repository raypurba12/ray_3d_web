import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";

import { useAuth } from "../../features/admin/auth/useAuth";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import { describeError } from "../../features/admin/ui/serverErrors";
import {
  buttonPrimary,
  inputClass,
  labelClass,
  panelClass,
} from "../../features/admin/ui/styles";
import { request } from "../../lib/api";

const AccountPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword !== form.confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSubmitting(true);
    try {
      await request("/auth/password", {
        method: "PUT",
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      setSuccess("Password diperbarui. Mengarahkan ke halaman login…");
      window.setTimeout(() => {
        logout();
        navigate("/admin/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(describeError(err, "Gagal memperbarui password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Security"
        title="Account"
        description="Ganti password admin. Semua sesi lain akan dikeluarkan setelah perubahan."
      />

      <form onSubmit={handleSubmit} className={`${panelClass} max-w-xl space-y-5 p-6`}>
        <div className="flex items-center gap-3 text-acid">
          <KeyRound size={18} />
          <p className="font-mono text-[11px] uppercase tracking-[0.25em]">
            Change password
          </p>
        </div>

        <label className="block">
          <span className={labelClass}>Password saat ini</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={update("currentPassword")}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Password baru</span>
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={form.newPassword}
            onChange={update("newPassword")}
            className={inputClass}
          />
          <span className="mt-1.5 block text-xs text-white/40">
            Minimal 12 karakter dan memenuhi 3 dari 4 kategori: huruf besar,
            huruf kecil, angka, simbol.
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>Ulangi password baru</span>
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-emerald-400">
            {success}
          </p>
        )}

        <button type="submit" disabled={submitting} className={buttonPrimary}>
          {submitting ? "Menyimpan…" : "Perbarui password"}
        </button>
      </form>
    </div>
  );
};

export default AccountPage;
