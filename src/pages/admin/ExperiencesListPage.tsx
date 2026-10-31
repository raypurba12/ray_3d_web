import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";

import {
  deleteExperience,
  listExperiences,
} from "../../features/admin/experiences/api";
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
import type { AdminExperience } from "../../types/admin";

const formatMonth = (value: string) => {
  const [year, month] = value.slice(0, 10).split("-");
  if (!year || !month) return value;
  return new Date(`${year}-${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const ExperiencesListPage = () => {
  const {
    items: experiences,
    loading,
    error,
    reload,
  } = useAdminList(listExperiences, "Gagal memuat experience.");

  const [confirmTarget, setConfirmTarget] = useState<AdminExperience | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteExperience(confirmTarget.id);
      setConfirmTarget(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus experience."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Experiences"
        description="Kelola riwayat kerja yang tampil di timeline."
        action={
          <Link to="/admin/experiences/new" className={buttonPrimary}>
            <Plus size={16} />
            New experience
          </Link>
        }
      />

      {loading && <ListSkeleton />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && experiences.length === 0 && (
        <ListEmpty
          title="Belum ada experience"
          description="Tambahkan pengalaman pertama untuk mengisi timeline."
          action={
            <Link to="/admin/experiences/new" className={buttonPrimary}>
              <Plus size={16} />
              New experience
            </Link>
          }
        />
      )}

      {!loading && !error && experiences.length > 0 && (
        <ul className="mt-8 space-y-4">
          {experiences.map((experience) => (
            <li
              key={experience.id}
              className={`${panelClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
                {experience.companyLogo ? (
                  <img
                    src={resolveAssetUrl(experience.companyLogo)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <Building2 size={20} className="text-white/30" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-base font-bold text-white">
                    {experience.title}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                    #{experience.order}
                  </span>
                </div>

                <p className="mt-0.5 text-sm text-secondary">
                  {experience.company}
                  {experience.location ? ` · ${experience.location}` : ""}
                </p>

                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-acid/80">
                  {formatMonth(experience.startDate)} —{" "}
                  {experience.endDate
                    ? formatMonth(experience.endDate)
                    : "Present"}
                </p>

                {experience.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {experience.technologies.map((tech) => (
                      <span key={tech.id} className={chipClass}>
                        {tech.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/admin/experiences/${experience.id}/edit`}
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
                    setConfirmTarget(experience);
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
        title="Hapus experience ini?"
        description={`"${
          confirmTarget?.title ?? ""
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

export default ExperiencesListPage;
