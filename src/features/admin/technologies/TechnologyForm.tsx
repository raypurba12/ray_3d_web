import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import type {
  AdminTechnology,
  TechCategory,
  TechnologyPayload,
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

const CATEGORIES: TechCategory[] = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS",
  "DESIGN",
  "OTHER",
];

type TechnologyFormProps = {
  mode: "create" | "edit";
  initialTechnology: AdminTechnology | null;
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: TechnologyPayload) => void;
  onCancel: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const TechnologyForm = ({
  mode,
  initialTechnology,
  submitting,
  serverErrors,
  banner,
  onSubmit,
  onCancel,
}: TechnologyFormProps) => {
  const [name, setName] = useState(initialTechnology?.name ?? "");
  const [icon, setIcon] = useState(initialTechnology?.icon ?? "");
  const [category, setCategory] = useState<TechCategory>(
    initialTechnology?.category ?? "FRONTEND"
  );
  const [order, setOrder] = useState(
    initialTechnology ? String(initialTechnology.order) : "0"
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = "Nama teknologi wajib diisi.";
    }
    if (!icon.trim()) {
      nextErrors.icon = "Icon wajib diisi (upload atau URL).";
    }

    const orderValue = order.trim();
    if (orderValue !== "" && !Number.isInteger(Number(orderValue))) {
      nextErrors.order = "Order harus berupa angka bulat.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      icon: icon.trim(),
      category,
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
            placeholder="e.g. React"
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

      <div>
        <label className={labelClass} htmlFor="category">
          Category
        </label>
        <select
          id="category"
          className={`${inputClass} [color-scheme:dark]`}
          value={category}
          onChange={(event) => setCategory(event.target.value as TechCategory)}
          disabled={submitting}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      <ImageField
        label="Icon"
        aspectClass="aspect-square max-w-[180px]"
        required
        value={icon}
        error={errors.icon}
        onChange={setIcon}
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
              ? "Buat technology"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
};

export default TechnologyForm;
