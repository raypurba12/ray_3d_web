import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type {
  AdminProject,
  AdminTechnology,
  ProjectPayload,
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

type ProjectFormProps = {
  mode: "create" | "edit";
  initialProject: AdminProject | null;
  technologies: AdminTechnology[];
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: ProjectPayload) => void;
  onCancel: () => void;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={fieldErrorClass}>{message}</p> : null;

const ProjectForm = ({
  mode,
  initialProject,
  technologies,
  submitting,
  serverErrors,
  banner,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const [title, setTitle] = useState(initialProject?.title ?? "");
  const [description, setDescription] = useState(
    initialProject?.description ?? ""
  );
  const [image, setImage] = useState(initialProject?.image ?? "");
  const [metric, setMetric] = useState(initialProject?.metric ?? "");
  const [demoUrl, setDemoUrl] = useState(initialProject?.demoUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initialProject?.githubUrl ?? "");
  const [featured, setFeatured] = useState(initialProject?.featured ?? false);
  const [order, setOrder] = useState(
    initialProject ? String(initialProject.order) : "0"
  );
  const [tags, setTags] = useState(
    initialProject?.tags.map((tag) => tag.name).join(", ") ?? ""
  );
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    initialProject?.technologies.map((tech) => tech.id) ?? []
  );
  const [screenshots, setScreenshots] = useState(
    initialProject?.images.map((image) => ({
      image: image.image,
      caption: image.caption ?? "",
    })) ?? []
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const updateScreenshot = (
    index: number,
    patch: Partial<{ image: string; caption: string }>
  ) => {
    setScreenshots((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const addScreenshot = () => {
    setScreenshots((previous) => [...previous, { image: "", caption: "" }]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (title.trim().length < 3) {
      nextErrors.title = "Judul minimal 3 karakter.";
    }
    if (description.trim().length < 10) {
      nextErrors.description = "Deskripsi minimal 10 karakter.";
    }
    if (!image.trim()) {
      nextErrors.image = "Gambar wajib diisi (upload atau URL).";
    }

    const orderValue = order.trim();
    if (orderValue !== "" && !Number.isInteger(Number(orderValue))) {
      nextErrors.order = "Order harus berupa angka bulat.";
    }

    const incompleteShot = screenshots.findIndex(
      (shot) => !shot.image.trim() && shot.caption.trim() !== ""
    );
    if (incompleteShot >= 0) {
      nextErrors.images = `Screenshot ${
        incompleteShot + 1
      } punya caption tapi belum ada gambarnya.`;
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      metric: metric.trim(),
      demoUrl: demoUrl.trim(),
      githubUrl: githubUrl.trim(),
      featured,
      order: orderValue === "" ? 0 : Number(orderValue),
      tags: [
        ...new Set(
          tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        ),
      ],
      technologies: selectedTechs,
      images: screenshots
        .filter((shot) => shot.image.trim())
        .map((shot) => ({
          image: shot.image.trim(),
          caption: shot.caption.trim(),
        })),
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
            placeholder="Nama project"
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

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={`${inputClass} resize-y`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Deskripsi singkat project..."
          disabled={submitting}
        />
        <FieldError message={errors.description} />
      </div>

      <ImageField value={image} error={errors.image} onChange={setImage} />

      <div>
        <label className={labelClass} htmlFor="metric">
          Metric / impact (optional)
        </label>
        <input
          id="metric"
          className={inputClass}
          value={metric}
          onChange={(event) => setMetric(event.target.value)}
          placeholder="e.g. 60 FPS • 45% faster API"
          disabled={submitting}
        />
        <FieldError message={errors.metric} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className={labelClass}>Screenshots (optional)</span>
          <button
            type="button"
            className={`${buttonGhost} px-4 py-1.5 text-xs`}
            onClick={addScreenshot}
            disabled={submitting}
          >
            <Plus size={14} />
            Add screenshot
          </button>
        </div>

        {screenshots.length === 0 ? (
          <p className="text-xs text-white/30">
            Tambah screenshot untuk menampilkan galeri foto di kartu project.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {screenshots.map((shot, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Screenshot {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove screenshot ${index + 1}`}
                    className="text-white/40 transition hover:text-red-300"
                    onClick={() => removeScreenshot(index)}
                    disabled={submitting}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <ImageField
                  value={shot.image}
                  onChange={(value) => updateScreenshot(index, { image: value })}
                />

                <div>
                  <label
                    className={labelClass}
                    htmlFor={`screenshot-caption-${index}`}
                  >
                    Caption
                  </label>
                  <input
                    id={`screenshot-caption-${index}`}
                    className={inputClass}
                    value={shot.caption}
                    onChange={(event) =>
                      updateScreenshot(index, { caption: event.target.value })
                    }
                    placeholder="Optional caption"
                    disabled={submitting}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <FieldError message={errors.images} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="demoUrl">
            Live demo URL
          </label>
          <input
            id="demoUrl"
            className={inputClass}
            value={demoUrl}
            onChange={(event) => setDemoUrl(event.target.value)}
            placeholder="https://..."
            disabled={submitting}
          />
          <FieldError message={errors.demoUrl} />
        </div>

        <div>
          <label className={labelClass} htmlFor="githubUrl">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            className={inputClass}
            value={githubUrl}
            onChange={(event) => setGithubUrl(event.target.value)}
            placeholder="https://github.com/..."
            disabled={submitting}
          />
          <FieldError message={errors.githubUrl} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="tags">
          Tags
        </label>
        <input
          id="tags"
          className={inputClass}
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Web Development, 3D Graphics"
          disabled={submitting}
        />
        <p className="mt-1.5 text-xs text-white/30">
          Pisahkan dengan koma. Tag baru dibuat otomatis.
        </p>
        <FieldError message={errors.tags} />
      </div>

      <TechnologiesPicker
        options={technologies}
        selected={selectedTechs}
        error={errors.technologies}
        onChange={setSelectedTechs}
      />

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
              ? "Buat project"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
