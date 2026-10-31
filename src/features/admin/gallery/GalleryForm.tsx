import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import type {
  AdminGalleryImage,
  GalleryImagePayload,
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

type GalleryFormProps = {
  mode: "create" | "edit";
  initialImage: AdminGalleryImage | null;
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: GalleryImagePayload) => void;
  onCancel: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const GalleryForm = ({
  mode,
  initialImage,
  submitting,
  serverErrors,
  banner,
  onSubmit,
  onCancel,
}: GalleryFormProps) => {
  const [title, setTitle] = useState(initialImage?.title ?? "");
  const [image, setImage] = useState(initialImage?.image ?? "");
  const [order, setOrder] = useState(
    initialImage ? String(initialImage.order) : "0"
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!image.trim()) {
      nextErrors.image = "Gambar wajib diisi (upload atau URL).";
    }

    const orderValue = order.trim();
    if (orderValue !== "" && !Number.isInteger(Number(orderValue))) {
      nextErrors.order = "Order harus berupa angka bulat.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      image: image.trim(),
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

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <label className={labelClass} htmlFor="title">
            Title (optional)
          </label>
          <input
            id="title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Neon grid study"
            disabled={submitting}
          />
          <FieldError message={errors.title} />
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

      <ImageField
        value={image}
        error={errors.image}
        label="Photo"
        aspectClass="aspect-[4/3]"
        required
        onChange={setImage}
      />

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
              ? "Tambah foto"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
};

export default GalleryForm;
