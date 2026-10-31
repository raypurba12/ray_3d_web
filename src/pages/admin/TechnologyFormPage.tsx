import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  createTechnology,
  getTechnology,
  updateTechnology,
} from "../../features/admin/technologies/api";
import TechnologyForm from "../../features/admin/technologies/TechnologyForm";
import {
  describeError,
  toFieldErrors,
} from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type { AdminTechnology, TechnologyPayload } from "../../types/admin";

const TECHNOLOGY_FIELDS = new Set(["name", "icon", "category", "order"]);

const TechnologyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [technology, setTechnology] = useState<AdminTechnology | null>(null);
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
        const current = id ? await getTechnology(id) : null;
        if (!cancelled) setTechnology(current);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat data teknologi."));
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

  const handleSubmit = async (payload: TechnologyPayload) => {
    setSubmitting(true);
    setBanner(null);
    setFieldErrors({});

    try {
      if (id) {
        await updateTechnology(id, payload);
      } else {
        await createTechnology(payload);
      }
      navigate("/admin/technologies");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, TECHNOLOGY_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan teknologi."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/admin/technologies"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-secondary transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to technologies
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit technology" : "New technology"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {isEdit
          ? "Perbarui nama, icon, dan kategori teknologi."
          : "Tambahkan teknologi yang tampil di orbit 3D dan pilihan project."}
      </p>

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/admin/technologies" className={buttonGhost}>
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
        <TechnologyForm
          mode={isEdit ? "edit" : "create"}
          initialTechnology={technology}
          submitting={submitting}
          serverErrors={fieldErrors}
          banner={banner}
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => navigate("/admin/technologies")}
        />
      )}
    </div>
  );
};

export default TechnologyFormPage;
