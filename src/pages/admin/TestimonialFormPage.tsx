import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  createTestimonial,
  getTestimonial,
  updateTestimonial,
} from "../../features/admin/testimonials/api";
import TestimonialForm from "../../features/admin/testimonials/TestimonialForm";
import {
  describeError,
  toFieldErrors,
} from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type {
  AdminTestimonial,
  TestimonialPayload,
} from "../../types/admin";

const TESTIMONIAL_FIELDS = new Set([
  "name",
  "role",
  "company",
  "avatar",
  "content",
  "rating",
  "featured",
  "order",
]);

const TestimonialFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [testimonial, setTestimonial] = useState<AdminTestimonial | null>(
    null
  );
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
        const current = id ? await getTestimonial(id) : null;
        if (!cancelled) setTestimonial(current);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat data testimonial."));
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

  const handleSubmit = async (payload: TestimonialPayload) => {
    setSubmitting(true);
    setBanner(null);
    setFieldErrors({});

    try {
      if (id) {
        await updateTestimonial(id, payload);
      } else {
        await createTestimonial(payload);
      }
      navigate("/admin/testimonials");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, TESTIMONIAL_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan testimonial."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/admin/testimonials"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-secondary transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to testimonials
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit testimonial" : "New testimonial"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {isEdit
          ? "Perbarui isi testimoni, rating, dan status featured."
          : "Isi testimoni yang akan tampil di halaman feedback."}
      </p>

      {loading && <div className={`${panelClass} mt-6 h-72 animate-pulse`} />}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/admin/testimonials" className={buttonGhost}>
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
        <TestimonialForm
          mode={isEdit ? "edit" : "create"}
          initialTestimonial={testimonial}
          submitting={submitting}
          serverErrors={fieldErrors}
          banner={banner}
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => navigate("/admin/testimonials")}
        />
      )}
    </div>
  );
};

export default TestimonialFormPage;
