import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import type {
  AdminTestimonial,
  TestimonialPayload,
} from "../../../types/admin";
import ImageField from "../ui/ImageField";
import {
  buttonGhost,
  buttonPrimary,
  fieldErrorClass,
  inputClass,
  labelClass,
  panelClass,
} from "../ui/styles";

const RATINGS = [5, 4, 3, 2, 1];

type TestimonialFormProps = {
  mode: "create" | "edit";
  initialTestimonial: AdminTestimonial | null;
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: TestimonialPayload) => void;
  onCancel: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const TestimonialForm = ({
  mode,
  initialTestimonial,
  submitting,
  serverErrors,
  banner,
  onSubmit,
  onCancel,
}: TestimonialFormProps) => {
  const [name, setName] = useState(initialTestimonial?.name ?? "");
  const [role, setRole] = useState(initialTestimonial?.role ?? "");
  const [company, setCompany] = useState(initialTestimonial?.company ?? "");
  const [avatar, setAvatar] = useState(initialTestimonial?.avatar ?? "");
  const [content, setContent] = useState(initialTestimonial?.content ?? "");
  const [rating, setRating] = useState(initialTestimonial?.rating ?? 5);
  const [featured, setFeatured] = useState(
    initialTestimonial?.featured ?? false
  );
  const [order, setOrder] = useState(
    initialTestimonial ? String(initialTestimonial.order) : "0"
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Nama minimal 2 karakter.";
    }
    if (role.trim().length < 2) {
      nextErrors.role = "Role minimal 2 karakter.";
    }
    if (!company.trim()) {
      nextErrors.company = "Perusahaan wajib diisi.";
    }
    if (content.trim().length < 10) {
      nextErrors.content = "Testimoni minimal 10 karakter.";
    }

    const orderValue = order.trim();
    if (orderValue !== "" && !Number.isInteger(Number(orderValue))) {
      nextErrors.order = "Order harus berupa angka bulat.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      avatar: avatar.trim(),
      content: content.trim(),
      rating,
      featured,
      order: orderValue === "" ? 0 : Number(orderValue),
    });
  };

  return (
    <form
      className={`${panelClass} mt-6 space-y-6 p-6`}
      onSubmit={handleSubmit}
      noValidate
    >
      {banner && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {banner}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_160px]">
        <div>
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama pemberi testimoni"
            disabled={submitting}
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor="order">
            Order
          </label>
          <input
            id="order"
            type="number"
            className={inputClass}
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            disabled={submitting}
          />
          <FieldError message={errors.order} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            className={inputClass}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Head of Product"
            disabled={submitting}
          />
          <FieldError message={errors.role} />
        </div>

        <div>
          <label className={labelClass} htmlFor="company">
            Company
          </label>
          <input
            id="company"
            className={inputClass}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Nama perusahaan"
            disabled={submitting}
          />
          <FieldError message={errors.company} />
        </div>
      </div>

      <ImageField
        label="Avatar (optional)"
        aspectClass="aspect-square max-w-[180px]"
        value={avatar}
        error={errors.avatar}
        onChange={setAvatar}
      />

      <div>
        <label className={labelClass} htmlFor="content">
          Testimonial
        </label>
        <textarea
          id="content"
          rows={4}
          className={`${inputClass} resize-y`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Isi testimoni..."
          disabled={submitting}
        />
        <FieldError message={errors.content} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-end">
        <div>
          <label className={labelClass} htmlFor="rating">
            Rating
          </label>
          <select
            id="rating"
            className={`${inputClass} [color-scheme:dark]`}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            disabled={submitting}
          >
            {RATINGS.map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
          <FieldError message={errors.rating} />
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-4 w-4 accent-acid"
            disabled={submitting}
          />
          Tampilkan sebagai featured
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/5 pt-6">
        <button
          type="button"
          className={buttonGhost}
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </button>
        <button type="submit" className={buttonPrimary} disabled={submitting}>
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting
            ? "Menyimpan..."
            : mode === "create"
              ? "Buat testimonial"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
};

export default TestimonialForm;
