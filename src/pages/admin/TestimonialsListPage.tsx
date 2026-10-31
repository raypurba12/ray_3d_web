import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

import {
  deleteTestimonial,
  listTestimonials,
} from "../../features/admin/testimonials/api";
import { ConfirmDialog } from "../../features/admin/ui/ConfirmDialog";
import {
  ListEmpty,
  ListError,
  ListSkeleton,
} from "../../features/admin/ui/ListState";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import { describeError } from "../../features/admin/ui/serverErrors";
import {
  buttonGhost,
  buttonPrimary,
  panelClass,
} from "../../features/admin/ui/styles";
import { useAdminList } from "../../features/admin/ui/useAdminList";
import { resolveAssetUrl } from "../../lib/api";
import type { AdminTestimonial } from "../../types/admin";

const TestimonialsListPage = () => {
  const {
    items: testimonials,
    loading,
    error,
    reload,
  } = useAdminList(listTestimonials, "Gagal memuat testimonial.");

  const [confirmTarget, setConfirmTarget] = useState<AdminTestimonial | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTestimonial(confirmTarget.id);
      setConfirmTarget(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus testimonial."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Kelola testimoni klien yang tampil di halaman feedback."
        action={
          <Link to="/admin/testimonials/new" className={buttonPrimary}>
            <Plus size={16} />
            New testimonial
          </Link>
        }
      />

      {loading && <ListSkeleton />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && testimonials.length === 0 && (
        <ListEmpty
          title="Belum ada testimonial"
          description="Tambahkan testimoni pertama untuk mengisi halaman feedback."
          action={
            <Link to="/admin/testimonials/new" className={buttonPrimary}>
              <Plus size={16} />
              New testimonial
            </Link>
          }
        />
      )}

      {!loading && !error && testimonials.length > 0 && (
        <ul className="mt-8 space-y-4">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.id}
              className={`${panelClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent font-display text-sm font-bold text-white/60">
                {testimonial.avatar ? (
                  <img
                    src={resolveAssetUrl(testimonial.avatar)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  testimonial.name.slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-base font-bold text-white">
                    {testimonial.name}
                  </h2>
                  {testimonial.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-acid/30 bg-acid/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-acid">
                      Featured
                    </span>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                    #{testimonial.order}
                  </span>
                </div>

                <p className="mt-0.5 text-sm text-secondary">
                  {testimonial.role} · {testimonial.company}
                </p>

                <div className="mt-1.5 flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={12}
                      className={
                        index < testimonial.rating
                          ? "fill-acid text-acid"
                          : "text-white/20"
                      }
                    />
                  ))}
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-secondary">
                  {testimonial.content}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/admin/testimonials/${testimonial.id}/edit`}
                  className={buttonGhost}
                >
                  <Pencil size={14} />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button
                  type="button"
                  className={`${buttonGhost} hover:border-red-400/40 hover:text-red-300`}
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmTarget(testimonial);
                  }}
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Hapus testimonial ini?"
        description={`Testimoni dari "${
          confirmTarget?.name ?? ""
        }" akan dihapus permanen dan tidak bisa dikembalikan.`}
        busy={deleting}
        error={deleteError}
        onCancel={() => {
          if (!deleting) setConfirmTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
};

export default TestimonialsListPage;
