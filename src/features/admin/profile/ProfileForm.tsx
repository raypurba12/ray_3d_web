import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Info, Loader2, Upload } from "lucide-react";

import type { AdminProfile, ProfilePayload } from "../../../types/admin";
import { resolveAssetUrl, uploadFile } from "../../../lib/api";
import ImageField from "../ui/ImageField";
import { describeError } from "../ui/serverErrors";
import {
  buttonGhost,
  buttonPrimary,
  fieldErrorClass,
  inputClass,
  labelClass,
  panelClass,
} from "../ui/styles";

type ProfileFormProps = {
  initialProfile: AdminProfile | null;
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: ProfilePayload) => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ProfileForm = ({
  initialProfile,
  submitting,
  serverErrors,
  banner,
  onSubmit,
}: ProfileFormProps) => {
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [tagline, setTagline] = useState(initialProfile?.tagline ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [avatar, setAvatar] = useState(initialProfile?.avatar ?? "");
  const [email, setEmail] = useState(initialProfile?.email ?? "");
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resumeUrl ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [location, setLocation] = useState(initialProfile?.location ?? "");
  const [github, setGithub] = useState(initialProfile?.github ?? "");
  const [linkedin, setLinkedin] = useState(initialProfile?.linkedin ?? "");
  const [twitter, setTwitter] = useState(initialProfile?.twitter ?? "");
  const [website, setWebsite] = useState(initialProfile?.website ?? "");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(
    null
  );
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const errors = { ...serverErrors, ...clientErrors };
  const isNew = initialProfile === null;

  const handleResumeFile = async (file: File | undefined) => {
    if (!file) return;

    setResumeUploadError(null);

    if (file.type !== "application/pdf") {
      setResumeUploadError("File CV harus berformat PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError("Ukuran file maksimal 5MB.");
      return;
    }

    setResumeUploading(true);
    setResumeProgress(0);

    try {
      const asset = await uploadFile(file, setResumeProgress);
      setResumeUrl(asset.path);
      setResumeProgress(100);
    } catch (err) {
      setResumeUploadError(describeError(err, "Upload CV gagal."));
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Nama minimal 2 karakter.";
    }
    if (tagline.trim().length < 2) {
      nextErrors.tagline = "Tagline minimal 2 karakter.";
    }
    if (bio.trim().length < 10) {
      nextErrors.bio = "Bio minimal 10 karakter.";
    }
    if (!avatar.trim()) {
      nextErrors.avatar = "Avatar wajib diisi (upload atau URL).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Email tidak valid.";
    }

    const urlFields: Array<[string, string]> = [
      ["github", github],
      ["linkedin", linkedin],
      ["twitter", twitter],
      ["website", website],
    ];
    for (const [field, value] of urlFields) {
      if (value.trim() && !isValidUrl(value.trim())) {
        nextErrors[field] = "URL harus diawali http:// atau https://";
      }
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      email: email.trim(),
      resumeUrl: resumeUrl.trim(),
      phone: phone.trim(),
      location: location.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
      twitter: twitter.trim(),
      website: website.trim(),
    });
  };

  return (
    <form
      className={`${panelClass} mt-6 space-y-6 p-6`}
      onSubmit={handleSubmit}
      noValidate
    >
      {isNew && (
        <div className="flex items-start gap-3 rounded-lg border border-acid/25 bg-acid/[0.06] px-3 py-2.5 text-sm text-acid/90">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Profil belum ada di database. Field bertanda * wajib diisi untuk
            membuat profil baru.
          </span>
        </div>
      )}

      {banner && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {banner}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama lengkap"
            disabled={submitting}
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor="tagline">
            Tagline <span className="text-red-400">*</span>
          </label>
          <input
            id="tagline"
            className={inputClass}
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            placeholder="e.g. Full Stack Developer & 3D Web Specialist"
            disabled={submitting}
          />
          <FieldError message={errors.tagline} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="bio">
          Bio <span className="text-red-400">*</span>
        </label>
        <textarea
          id="bio"
          rows={5}
          className={`${inputClass} resize-y`}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Ceritakan singkat tentang dirimu..."
          disabled={submitting}
        />
        <FieldError message={errors.bio} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hello@raypurba.com"
            disabled={submitting}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className={inputClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Jakarta, Indonesia"
            disabled={submitting}
          />
          <FieldError message={errors.location} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className={inputClass}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+62..."
            disabled={submitting}
          />
          <FieldError message={errors.phone} />
        </div>

        <div>
          <label className={labelClass} htmlFor="resumeUrl">
            Resume / CV (PDF)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="resumeUrl"
              className={inputClass}
              value={resumeUrl}
              onChange={(event) => setResumeUrl(event.target.value)}
              placeholder="/uploads/cv.pdf"
              disabled={submitting}
            />
            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) =>
                void handleResumeFile(event.target.files?.[0])
              }
            />
            <button
              type="button"
              className={`${buttonGhost} whitespace-nowrap`}
              onClick={() => resumeInputRef.current?.click()}
              disabled={submitting || resumeUploading}
            >
              {resumeUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {resumeUploading ? `${resumeProgress}%` : "Upload PDF"}
            </button>
          </div>
          {resumeUploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-acid transition-all"
                style={{ width: `${resumeProgress}%` }}
              />
            </div>
          )}
          {resumeUploadError && (
            <p className={fieldErrorClass}>{resumeUploadError}</p>
          )}
          <p className="mt-1.5 text-xs text-white/30">
            Upload PDF (maks. 5MB) atau isi URL/path manual.
          </p>
          {resumeUrl && (
            <a
              href={resolveAssetUrl(resumeUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-xs text-acid hover:underline"
            >
              Lihat CV saat ini →
            </a>
          )}
          <FieldError message={errors.resumeUrl} />
        </div>
      </div>

      <ImageField
        label="Avatar (tampil di badge lanyard hero)"
        aspectClass="aspect-square max-w-[180px]"
        required
        value={avatar}
        error={errors.avatar}
        onChange={setAvatar}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="github">
            GitHub URL
          </label>
          <input
            id="github"
            className={inputClass}
            value={github}
            onChange={(event) => setGithub(event.target.value)}
            placeholder="https://github.com/..."
            disabled={submitting}
          />
          <FieldError message={errors.github} />
        </div>

        <div>
          <label className={labelClass} htmlFor="linkedin">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            className={inputClass}
            value={linkedin}
            onChange={(event) => setLinkedin(event.target.value)}
            placeholder="https://linkedin.com/in/..."
            disabled={submitting}
          />
          <FieldError message={errors.linkedin} />
        </div>

        <div>
          <label className={labelClass} htmlFor="twitter">
            Twitter / X URL
          </label>
          <input
            id="twitter"
            className={inputClass}
            value={twitter}
            onChange={(event) => setTwitter(event.target.value)}
            placeholder="https://x.com/..."
            disabled={submitting}
          />
          <FieldError message={errors.twitter} />
        </div>

        <div>
          <label className={labelClass} htmlFor="website">
            Website URL
          </label>
          <input
            id="website"
            className={inputClass}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://..."
            disabled={submitting}
          />
          <FieldError message={errors.website} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/5 pt-6">
        <button type="submit" className={buttonPrimary} disabled={submitting}>
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Menyimpan..." : "Simpan profil"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
