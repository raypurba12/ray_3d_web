import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  createExperience,
  getExperience,
  updateExperience,
} from "../../features/admin/experiences/api";
import ExperienceForm from "../../features/admin/experiences/ExperienceForm";
import { listTechnologies } from "../../features/admin/technologies/api";
import {
  describeError,
  toFieldErrors,
} from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type {
  AdminExperience,
  AdminTechnology,
  ExperiencePayload,
} from "../../types/admin";

const EXPERIENCE_FIELDS = new Set([
  "title",
  "company",
  "companyLogo",
  "location",
  "startDate",
  "endDate",
  "description",
  "order",
  "technologies",
]);

const ExperienceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [experience, setExperience] = useState<AdminExperience | null>(null);
  const [technologies, setTechnologies] = useState<AdminTechnology[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setBanner(null);
    setFieldErrors({});

    const load = async () => {
      try {
        const [techs, current] = await Promise.all([
          listTechnologies(),
          id ? getExperience(id) : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setTechnologies(techs);
        setExperience(current);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat data experience."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (payload: ExperiencePayload) => {
    setSubmitting(true);
    setBanner(null);
    setFieldErrors({});

    try {
      if (id) {
        await updateExperience(id, payload);
      } else {
        await createExperience(payload);
      }
      navigate("/admin/experiences");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, EXPERIENCE_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan experience."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/admin/experiences"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-secondary transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to experiences
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit experience" : "New experience"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {isEdit
          ? "Perbarui detail pengalaman dan teknologi yang dipakai."
          : "Isi detail pengalaman yang akan tampil di timeline."}
      </p>

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/admin/experiences" className={buttonGhost}>
              Kembali
            </Link>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {!loading && !loadError && (
        <ExperienceForm
          mode={isEdit ? "edit" : "create"}
          initialExperience={experience}
          technologies={technologies}
          submitting={submitting}
          serverErrors={fieldErrors}
          banner={banner}
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => navigate("/admin/experiences")}
        />
      )}
    </div>
  );
};

export default ExperienceFormPage;
