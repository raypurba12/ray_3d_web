import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  createGalleryImage,
  getGalleryImage,
  updateGalleryImage,
} from "../../features/admin/gallery/api";
import GalleryForm from "../../features/admin/gallery/GalleryForm";
import {
  describeError,
  toFieldErrors,
} from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type {
  AdminGalleryImage,
  GalleryImagePayload,
} from "../../types/admin";

const GALLERY_FIELDS = new Set(["title", "image", "order"]);

const GalleryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [image, setImage] = useState<AdminGalleryImage | null>(null);
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
        const current = id ? await getGalleryImage(id) : null;
        if (cancelled) return;
        setImage(current);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat foto."));
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

  const handleSubmit = async (payload: GalleryImagePayload) => {
    setSubmitting(true);
    setBanner(null);
    setFieldErrors({});

    try {
      if (id) {
        await updateGalleryImage(id, payload);
      } else {
        await createGalleryImage(payload);
      }
      navigate("/admin/gallery");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, GALLERY_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan foto."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/admin/gallery"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-secondary transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to gallery
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit photo" : "Add photo"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {isEdit
          ? "Perbarui judul, gambar, atau urutan foto."
          : "Upload foto baru untuk bagian Gallery di situs publik."}
      </p>

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/admin/gallery" className={buttonGhost}>
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
        <GalleryForm
          mode={isEdit ? "edit" : "create"}
          initialImage={image}
          submitting={submitting}
          serverErrors={fieldErrors}
          banner={banner}
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => navigate("/admin/gallery")}
        />
      )}
    </div>
  );
};

export default GalleryFormPage;
