import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  getProfileOrNull,
  saveProfile,
} from "../../features/admin/profile/api";
import ProfileForm from "../../features/admin/profile/ProfileForm";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import {
  describeError,
  toFieldErrors,
} from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type { AdminProfile, ProfilePayload } from "../../types/admin";

const PROFILE_FIELDS = new Set([
  "name",
  "tagline",
  "bio",
  "avatar",
  "resumeUrl",
  "email",
  "phone",
  "location",
  "github",
  "linkedin",
  "twitter",
  "website",
]);

const ProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getProfileOrNull()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat profil."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleSubmit = async (payload: ProfilePayload) => {
    setSubmitting(true);
    setBanner(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const saved = await saveProfile(payload);
      setProfile(saved);
      setSuccess("Profil berhasil disimpan.");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, PROFILE_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan profil."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Identitas utama yang dipakai di hero, about, dan kontak."
        action={
          <Link to="/admin/projects" className={buttonGhost}>
            <ArrowLeft size={14} />
            Back to projects
          </Link>
        }
      />

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <button
            type="button"
            className={`${buttonGhost} mt-4`}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {success && (
            <p
              role="status"
              className="mt-6 rounded-lg border border-acid/30 bg-acid/10 px-3 py-2 text-sm text-acid"
            >
              {success}
            </p>
          )}

          <ProfileForm
            initialProfile={profile}
            submitting={submitting}
            serverErrors={fieldErrors}
            banner={banner}
            onSubmit={(payload) => void handleSubmit(payload)}
          />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
