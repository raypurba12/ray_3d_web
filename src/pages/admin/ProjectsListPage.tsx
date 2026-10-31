import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { deleteProject, listProjects } from "../../features/admin/projects/api";
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
import type { AdminProject } from "../../types/admin";

const ProjectsListPage = () => {
  const {
    items: projects,
    loading,
    error,
    reload,
  } = useAdminList(listProjects, "Gagal memuat project.");

  const [confirmTarget, setConfirmTarget] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProject(confirmTarget.id);
      setConfirmTarget(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus project."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Kelola project yang tampil di halaman Works."
        action={
          <Link to="/admin/projects/new" className={buttonPrimary}>
            <Plus size={16} />
            New project
          </Link>
        }
      />

      {loading && <ListSkeleton />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && projects.length === 0 && (
        <ListEmpty
          title="Belum ada project"
          description="Tambahkan project pertama untuk mulai mengisi halaman Works."
          action={
            <Link to="/admin/projects/new" className={buttonPrimary}>
              <Plus size={16} />
              New project
            </Link>
          }
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <ul className="mt-8 space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`${panelClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-transparent">
                {project.image && (
                  <img
                    src={resolveAssetUrl(project.image)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-base font-bold text-white">
                    {project.title}
                  </h2>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-acid/30 bg-acid/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-acid">
                      <Star size={10} />
                      Featured
                    </span>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                    #{project.order}
                  </span>
                </div>

                <p className="mt-1 text-sm text-secondary">
                  {project.description}
                </p>

                {project.metric && (
                  <p className="mt-1 font-mono text-[11px] text-acid/80">
                    {project.metric}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag.id} className={chipClass}>
                      {tag.name}
                    </span>
                  ))}
                  {project.technologies.length > 0 && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                      {project.technologies.length} tech
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonGhost}
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline">Demo</span>
                  </a>
                )}
                <Link
                  to={`/admin/projects/${project.id}/edit`}
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
                    setConfirmTarget(project);
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
        title="Hapus project ini?"
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

export default ProjectsListPage;
