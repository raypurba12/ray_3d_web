import { useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";

import {
  deleteGalleryImage,
  listGalleryImages,
} from "../../features/admin/gallery/api";
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
import type { AdminGalleryImage } from "../../types/admin";

const GalleryListPage = () => {
  const {
    items: images,
    loading,
    error,
    reload,
  } = useAdminList(listGalleryImages, "Gagal memuat galeri.");

  const [confirmTarget, setConfirmTarget] = useState<AdminGalleryImage | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteGalleryImage(confirmTarget.id);
      setConfirmTarget(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus foto."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Foto yang tampil di bagian Gallery situs publik."
        action={
          <Link to="/admin/gallery/new" className={buttonPrimary}>
            <Plus size={16} />
            Add photo
          </Link>
        }
      />

      {loading && <ListSkeleton />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && images.length === 0 && (
        <ListEmpty
          title="Belum ada foto"
          description="Upload foto pertama untuk menampilkan bagian Gallery di situs."
          action={
            <Link to="/admin/gallery/new" className={buttonPrimary}>
              <ImagePlus size={16} />
              Add photo
            </Link>
          }
        />
      )}

      {!loading && !error && images.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <li key={image.id} className={`${panelClass} overflow-hidden`}>
              <div className="relative aspect-[4/3] bg-gradient-to-br from-white/10 to-transparent">
                <img
                  src={resolveAssetUrl(image.image)}
                  alt={image.title ?? ""}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 backdrop-blur">
                  #{image.order}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3">
                <p className="min-w-0 flex-1 truncate text-sm text-white">
                  {image.title || (
                    <span className="text-white/30">Untitled</span>
                  )}
                </p>
                <Link
                  to={`/admin/gallery/${image.id}/edit`}
                  aria-label="Edit photo"
                  className={buttonGhost}
                >
                  <Pencil size={14} />
                </Link>
                <button
                  type="button"
                  aria-label="Delete photo"
                  className={`${buttonGhost} hover:border-red-400/40 hover:text-red-300`}
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmTarget(image);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Hapus foto ini?"
        description={`"${
          confirmTarget?.title || "Untitled"
        }" akan dihapus permanen dari galeri dan situs publik.`}
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

export default GalleryListPage;
