import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Save } from "lucide-react";

import type { SiteContent } from "../../../types";
import {
  buttonPrimary,
  fieldErrorClass,
  inputClass,
  labelClass,
  panelClass,
} from "../ui/styles";

type FieldSpec = {
  path: string;
  label: string;
  max: number;
  multiline?: boolean;
  rows?: number;
  wide?: boolean;
};

type Group = {
  title: string;
  description: string;
  fields: FieldSpec[];
};

const GROUPS: Group[] = [
  {
    title: "Hero",
    description: "Tampilan utama di bagian paling atas halaman.",
    fields: [
      { path: "hero.badge", label: "Status badge", max: 160, wide: true },
      { path: "hero.eyebrow", label: "Eyebrow", max: 160 },
      { path: "hero.title", label: "Judul", max: 200 },
      { path: "hero.titleAccent", label: "Judul aksen", max: 200 },
      { path: "hero.intro", label: "Intro", max: 600, multiline: true, rows: 3 },
    ],
  },
  {
    title: "About",
    description: "Label dan copy bagian overview.",
    fields: [
      { path: "sections.about.label", label: "Label", max: 80 },
      { path: "sections.about.title", label: "Judul", max: 160 },
      {
        path: "sections.about.content",
        label: "Deskripsi",
        max: 1200,
        multiline: true,
        rows: 4,
        wide: true,
      },
    ],
  },
  {
    title: "Experience",
    description: "Heading timeline karier.",
    fields: [
      { path: "sections.experience.label", label: "Label", max: 80 },
      { path: "sections.experience.title", label: "Judul", max: 160 },
    ],
  },
  {
    title: "Tech Stack",
    description: "Heading bagian teknologi.",
    fields: [
      { path: "sections.tech.label", label: "Label", max: 80 },
      { path: "sections.tech.title", label: "Judul", max: 160 },
    ],
  },
  {
    title: "Selected Works",
    description: "Heading dan deskripsi showcase proyek.",
    fields: [
      { path: "sections.works.label", label: "Label", max: 80 },
      { path: "sections.works.title", label: "Judul", max: 160 },
      {
        path: "sections.works.content",
        label: "Deskripsi",
        max: 1200,
        multiline: true,
        rows: 4,
        wide: true,
      },
    ],
  },
  {
    title: "Gallery",
    description: "Heading dan deskripsi arsip visual.",
    fields: [
      { path: "sections.gallery.label", label: "Label", max: 80 },
      { path: "sections.gallery.title", label: "Judul", max: 160 },
      {
        path: "sections.gallery.content",
        label: "Deskripsi",
        max: 600,
        multiline: true,
        rows: 3,
        wide: true,
      },
    ],
  },
  {
    title: "Testimonials",
    description: "Heading bagian kolaborasi.",
    fields: [
      { path: "sections.feedbacks.label", label: "Label", max: 80 },
      { path: "sections.feedbacks.title", label: "Judul", max: 160 },
    ],
  },
  {
    title: "Contact",
    description: "Heading formulir kontak.",
    fields: [
      { path: "contact.label", label: "Label", max: 80 },
      { path: "contact.title", label: "Judul", max: 160 },
    ],
  },
  {
    title: "Footer",
    description: "Teks di bagian bawah halaman.",
    fields: [
      { path: "footer.tagline", label: "Tagline", max: 120 },
      { path: "footer.note", label: "Catatan", max: 300, multiline: true, rows: 2 },
    ],
  },
];

const flatten = (content: SiteContent): Record<string, string> => ({
  "hero.badge": content.hero.badge,
  "hero.eyebrow": content.hero.eyebrow,
  "hero.title": content.hero.title,
  "hero.titleAccent": content.hero.titleAccent,
  "hero.intro": content.hero.intro,
  "sections.about.label": content.sections.about.label,
  "sections.about.title": content.sections.about.title,
  "sections.about.content": content.sections.about.content,
  "sections.experience.label": content.sections.experience.label,
  "sections.experience.title": content.sections.experience.title,
  "sections.tech.label": content.sections.tech.label,
  "sections.tech.title": content.sections.tech.title,
  "sections.works.label": content.sections.works.label,
  "sections.works.title": content.sections.works.title,
  "sections.works.content": content.sections.works.content,
  "sections.gallery.label": content.sections.gallery.label,
  "sections.gallery.title": content.sections.gallery.title,
  "sections.gallery.content": content.sections.gallery.content,
  "sections.feedbacks.label": content.sections.feedbacks.label,
  "sections.feedbacks.title": content.sections.feedbacks.title,
  "contact.label": content.contact.label,
  "contact.title": content.contact.title,
  "footer.tagline": content.footer.tagline,
  "footer.note": content.footer.note,
});

const buildContent = (values: Record<string, string>): SiteContent => ({
  hero: {
    badge: values["hero.badge"],
    eyebrow: values["hero.eyebrow"],
    title: values["hero.title"],
    titleAccent: values["hero.titleAccent"],
    intro: values["hero.intro"],
  },
  sections: {
    about: {
      label: values["sections.about.label"],
      title: values["sections.about.title"],
      content: values["sections.about.content"],
    },
    experience: {
      label: values["sections.experience.label"],
      title: values["sections.experience.title"],
    },
    tech: {
      label: values["sections.tech.label"],
      title: values["sections.tech.title"],
    },
    works: {
      label: values["sections.works.label"],
      title: values["sections.works.title"],
      content: values["sections.works.content"],
    },
    gallery: {
      label: values["sections.gallery.label"],
      title: values["sections.gallery.title"],
      content: values["sections.gallery.content"],
    },
    feedbacks: {
      label: values["sections.feedbacks.label"],
      title: values["sections.feedbacks.title"],
    },
  },
  contact: {
    label: values["contact.label"],
    title: values["contact.title"],
  },
  footer: {
    tagline: values["footer.tagline"],
    note: values["footer.note"],
  },
});

type SiteContentFormProps = {
  initialContent: SiteContent;
  submitting: boolean;
  serverErrors: Record<string, string>;
  banner: string | null;
  onSubmit: (payload: SiteContent) => void;
};

const SiteContentForm = ({
  initialContent,
  submitting,
  serverErrors,
  banner,
  onSubmit,
}: SiteContentFormProps) => {
  const [values, setValues] = useState(() => flatten(initialContent));
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = { ...serverErrors, ...clientErrors };

  const handleChange = (path: string, value: string) => {
    setValues((prev) => ({ ...prev, [path]: value }));
    setClientErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const trimmed: Record<string, string> = {};

    for (const group of GROUPS) {
      for (const field of group.fields) {
        const value = (values[field.path] ?? "").trim();
        trimmed[field.path] = value;
        if (!value) {
          nextErrors[field.path] = "Wajib diisi.";
        } else if (value.length > field.max) {
          nextErrors[field.path] = `Maksimal ${field.max} karakter.`;
        }
      }
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(buildContent(trimmed));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
      {banner && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {banner}
        </p>
      )}

      {GROUPS.map((group) => (
        <section key={group.title} className={`${panelClass} p-5 sm:p-6`}>
          <h2 className="font-display text-lg font-bold text-white">
            {group.title}
          </h2>
          <p className="mt-1 text-xs text-secondary">{group.description}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => {
              const value = values[field.path] ?? "";
              const error = errors[field.path];

              return (
                <label
                  key={field.path}
                  className={field.wide ? "sm:col-span-2" : undefined}
                >
                  <span className={labelClass}>{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      rows={field.rows ?? 3}
                      value={value}
                      maxLength={field.max}
                      disabled={submitting}
                      onChange={(event) =>
                        handleChange(field.path, event.target.value)
                      }
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      maxLength={field.max}
                      disabled={submitting}
                      onChange={(event) =>
                        handleChange(field.path, event.target.value)
                      }
                      className={inputClass}
                    />
                  )}
                  <span className="mt-1 block text-right font-mono text-[10px] text-white/30">
                    {value.length}/{field.max}
                  </span>
                  {error && <p className={fieldErrorClass}>{error}</p>}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" disabled={submitting} className={buttonPrimary}>
          {submitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {submitting ? "Saving..." : "Save site content"}
        </button>
      </div>
    </form>
  );
};

export default SiteContentForm;
