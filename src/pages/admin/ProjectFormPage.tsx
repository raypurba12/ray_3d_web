import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  createProject,
  getProject,
  listTechnologies,
  updateProject,
} from "../../features/admin/projects/api";
import ProjectForm from "../../features/admin/projects/ProjectForm";
import { describeError, toFieldErrors } from "../../features/admin/ui/serverErrors";
import { buttonGhost, panelClass } from "../../features/admin/ui/styles";
import { ApiError } from "../../lib/api";
import type {
  AdminProject,
  AdminTechnology,
  ProjectPayload,
} from "../../types/admin";

const PROJECT_FIELDS = new Set([
  "title",
  "description",
  "image",
  "metric",
  "demoUrl",
  "githubUrl",
  "featured",
  "order",
  "technologies",
  "tags",
  "images",
]);

const ProjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [project, setProject] = useState<AdminProject | null>(null);
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
          id ? getProject(id) : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setTechnologies(techs);
        setProject(current);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeError(err, "Gagal memuat data project."));
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

  const handleSubmit = async (payload: ProjectPayload) => {
    setSubmitting(true);
    setBanner(null);
    setFieldErrors({});

    try {
      if (id) {
        await updateProject(id, payload);
      } else {
        await createProject(payload);
      }
      navigate("/admin/projects");
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(toFieldErrors(err.issues, PROJECT_FIELDS));
        setBanner("Periksa kembali field yang ditandai.");
      } else {
        setBanner(describeError(err, "Gagal menyimpan project."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-secondary transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to projects
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit project" : "New project"}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        {isEdit
          ? "Perbarui detail project, gambar, dan relasinya."
          : "Isi detail project yang akan tampil di halaman Works."}
      </p>

      {loading && (
        <div className={`${panelClass} mt-6 h-72 animate-pulse`} />
      )}

      {!loading && loadError && (
        <div className={`${panelClass} mt-6 p-6 text-center`}>
          <p className="text-sm text-red-300">{loadError}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/admin/projects" className={buttonGhost}>
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
        <ProjectForm
          mode={isEdit ? "edit" : "create"}
          initialProject={project}
          technologies={technologies}
          submitting={submitting}
          serverErrors={fieldErrors}
          banner={banner}
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => navigate("/admin/projects")}
        />
      )}
    </div>
  );
};

export default ProjectFormPage;
