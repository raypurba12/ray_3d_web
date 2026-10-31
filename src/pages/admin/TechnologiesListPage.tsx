import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  deleteTechnology,
  listTechnologies,
} from "../../features/admin/technologies/api";
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
  chipClass,
  panelClass,
} from "../../features/admin/ui/styles";
import { useAdminList } from "../../features/admin/ui/useAdminList";
import { resolveAssetUrl } from "../../lib/api";
import type { AdminTechnology } from "../../types/admin";

const TechnologiesListPage = () => {
  const {
    items: technologies,
    loading,
    error,
    reload,
  } = useAdminList(listTechnologies, "Gagal memuat teknologi.");

  const [confirmTarget, setConfirmTarget] = useState<AdminTechnology | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTechnology(confirmTarget.id);
      setConfirmTarget(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus teknologi."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Technologies"
        description="Kelola stack teknologi yang tampil di orbit 3D dan form project."
        action={
          <Link to="/admin/technologies/new" className={buttonPrimary}>
            <Plus size={16} />
            New technology
          </Link>
        }
      />

      {loading && <ListSkeleton />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && technologies.length === 0 && (
        <ListEmpty
          title="Belum ada teknologi"
          description="Tambahkan teknologi pertama untuk mengisi orbit 3D."
          action={
            <Link to="/admin/technologies/new" className={buttonPrimary}>
              <Plus size={16} />
              New technology
            </Link>
          }
        />
      )}

      {!loading && !error && technologies.length > 0 && (
        <ul className="mt-8 space-y-4">
          {technologies.map((technology) => (
            <li
              key={technology.id}
              className={`${panelClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
                <img
                  src={resolveAssetUrl(technology.icon)}
                  alt=""
                  className="h-full w-full object-contain p-2"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-base font-bold text-white">
                    {technology.name}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                    #{technology.order}
                  </span>
                </div>
                <div className="mt-2">
                  <span className={chipClass}>{technology.category}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/admin/technologies/${technology.id}/edit`}
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
                    setConfirmTarget(technology);
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
        title="Hapus teknologi ini?"
        description={`"${
          confirmTarget?.name ?? ""
        }" akan dihapus permanen. Relasi ke project dan experience yang memakainya ikut terlepas.`}
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

export default TechnologiesListPage;
