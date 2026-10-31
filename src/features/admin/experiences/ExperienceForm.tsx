import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import type {
  AdminExperience,
  AdminTechnology,
  ExperiencePayload,
} from "../../../types/admin";
import ImageField from "../ui/ImageField";
import TechnologiesPicker from "../ui/TechnologiesPicker";
import {
  buttonGhost,
  buttonPrimary,
  fieldErrorClass,
  inputClass,
  labelClass,
  panelClass,
} from "../ui/styles";

type ExperienceFormProps = {
  mode: "create" | "edit";
  initialExperience: AdminExperience | null;
  technologies: AdminTechnology[];
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: ExperiencePayload) => void;
  onCancel: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const ExperienceForm = ({
  mode,
  initialExperience,
  technologies,
  submitting,
  serverErrors,
  banner,
  onSubmit,
  onCancel,
}: ExperienceFormProps) => {
  const [title, setTitle] = useState(initialExperience?.title ?? "");
  const [company, setCompany] = useState(initialExperience?.company ?? "");
  const [companyLogo, setCompanyLogo] = useState(
    initialExperience?.companyLogo ?? ""
  );
  const [location, setLocation] = useState(initialExperience?.location ?? "");
  const [startDate, setStartDate] = useState(
    initialExperience?.startDate.slice(0, 10) ?? ""
  );
  const [endDate, setEndDate] = useState(
    initialExperience?.endDate?.slice(0, 10) ?? ""
  );
  const [description, setDescription] = useState(
    initialExperience?.description ?? ""
  );
  const [order, setOrder] = useState(
    initialExperience ? String(initialExperience.order) : "0"
  );
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    initialExperience?.technologies.map((tech) => tech.id) ?? []
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (title.trim().length < 2) {
      nextErrors.title = "Judul minimal 2 karakter.";
    }
    if (company.trim().length < 2) {
      nextErrors.company = "Perusahaan minimal 2 karakter.";
    }
    if (!startDate) {
      nextErrors.startDate = "Tanggal mulai wajib diisi.";
    }
    if (description.trim().length < 10) {
      nextErrors.description = "Deskripsi minimal 10 karakter.";
    }
    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    }

    const orderValue = order.trim();
    if (orderValue !== "" && !Number.isInteger(Number(orderValue))) {
      nextErrors.order = "Order harus berupa angka bulat.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      company: company.trim(),
      companyLogo: companyLogo.trim(),
      location: location.trim(),
      startDate,
      endDate,
      description: description.trim(),
      order: orderValue === "" ? 0 : Number(orderValue),
      technologies: selectedTechs,
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
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Senior Creative Developer"
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

      <div className="grid gap-5 sm:grid-cols-2">
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

        <div>
          <label className={labelClass} htmlFor="location">
            Location (optional)
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

      <ImageField
        label="Company logo (optional)"
        aspectClass="aspect-square max-w-[180px]"
        value={companyLogo}
        error={errors.companyLogo}
        onChange={setCompanyLogo}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            className={`${inputClass} [color-scheme:dark]`}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={submitting}
          />
          <FieldError message={errors.startDate} />
        </div>

        <div>
          <label className={labelClass} htmlFor="endDate">
            End date (kosongkan jika masih berjalan)
          </label>
          <input
            id="endDate"
            type="date"
            className={`${inputClass} [color-scheme:dark]`}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={submitting}
          />
          <FieldError message={errors.endDate} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          className={`${inputClass} resize-y`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Satu pencapaian per baris..."
          disabled={submitting}
        />
        <p className="mt-1.5 text-xs text-white/30">
          Setiap baris akan tampil sebagai satu poin di timeline.
        </p>
        <FieldError message={errors.description} />
      </div>

      <TechnologiesPicker
        options={technologies}
        selected={selectedTechs}
        error={errors.technologies}
        onChange={setSelectedTechs}
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
              ? "Buat experience"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;
