import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Layers, Play } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import { CustomCursor } from "../components/layout/CustomCursor";
import { config } from "../constants/config";
import { github } from "../assets";
import { fetchProject } from "../features/portfolio/api";
import { mapProject } from "../features/portfolio/mappers";
import { ContentProvider } from "../features/portfolio/ContentProvider";
import { TProject } from "../types";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<TProject | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setErrorMessage("ID proyek tidak valid.");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    fetchProject(id)
      .then((data) => {
        setProject(mapProject(data));
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Gagal memuat data proyek."
        );
        console.error("Project fetch error:", err);
      });
  }, [id]);

  useEffect(() => {
    document.title = project ? `${project.name} — ${config.html.fullName}` : "Project — Loading…";
  }, [project]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        Syncing project data…
      </div>
    );
  }

  if (status === "error" || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-center px-6 sm:px-16">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-2">
          Project not found
        </h1>
        {errorMessage && (
          <p className="text-acid mb-4 text-sm font-mono">{errorMessage}</p>
        )}
        <p className="text-secondary mb-8">The project you are looking for does not exist.</p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-xs uppercase tracking-wider text-white/90 transition hover:border-acid/60 hover:text-acid"
        >
          <ArrowLeft size={14} />
          Kembali ke semua proyek
        </Link>
      </div>
    );
  }

  return (
    <ContentProvider>
      <div className="bg-[#09090b] text-white min-h-screen relative z-0 selection:bg-acid selection:text-black">
        <CustomCursor />
        <Navbar />
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-16 py-12 sm:pt-20 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 flex flex-col gap-6">
            {project.image && (
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-30 blur-xl"
                />
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  decoding="async"
                  className="relative h-full w-full object-contain object-center"
                />
              </div>
            )}
            {(project.images ?? []).length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {(project.images ?? []).slice(0, 4).map((shot) => (
                  <img
                    key={shot.id}
                    src={shot.image}
                    alt={shot.caption || `${project.name} screenshot`}
                    loading="lazy"
                    decoding="async"
                    className="h-[200px] w-full rounded-xl object-cover bg-white/[0.03] border border-white/10 transition hover:border-acid/50"
                  />
                ))}
              </div>
            )}
            {project.videoLink && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-acid backdrop-blur-md transition hover:bg-acid hover:text-black"
              >
                <Play size={13} className="fill-current" />
                Tonton demo video
              </button>
            )}
          </div>

          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {project.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-acid/40 bg-acid/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-acid">
                  <Layers size={11} />
                  Featured
                </span>
              )}
              {project.metric && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#09090b]/80 px-3 py-1 font-mono text-[10px] text-white/90 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-acid" />
                  {project.metric}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              {project.name}
            </h1>

            <p className="text-secondary text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>

            {(project.technologies ?? []).length > 0 && (
              <div className="mt-2">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Tech stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {(project.technologies ?? []).map((tech) => (
                    <span
                      key={tech.name}
                      className="group relative px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-acid/50 hover:bg-white/[0.08] font-mono text-xs text-white/90 transition-all cursor-default"
                      title={tech.category}
                    >
                      <img
                        src={tech.icon}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="shrink-0 h-4 w-4 object-contain mr-1.5"
                      />
                      {tech.name}
                      {tech.category && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/95 border border-acid/30 backdrop-blur-sm text-[10px] text-white/90 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                          {tech.category}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] text-white/60"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.liveDemoLink && (
                <a
                  href={project.liveDemoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-acid shadow-glow"
                >
                  Live demo
                  <ArrowUpRight size={15} />
                </a>
              )}
              {project.sourceCodeLink && (
                <a
                  href={project.sourceCodeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <img src={github} alt="github" className="w-4 h-4 object-contain" />
                  Source code
                </a>
              )}
              {project.videoLink && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-acid/40 bg-acid/10 px-5 py-2.5 text-sm font-medium text-acid transition hover:bg-acid hover:text-black"
                >
                  <Play size={14} className="fill-current" />
                  Demo video
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      {(project.images ?? []).length > 0 && (
        <section className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-16 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-acid">
                // Visual archive
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                Screenshots
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {(project.images ?? []).map((shot) => (
              <div key={shot.id} className="group relative rounded-xl overflow-hidden bg-white/[0.02] border border-white/10 transition hover:border-acid/50">
                <img
                  src={shot.image}
                  alt={shot.caption || `${project.name} screenshot`}
                  loading="lazy"
                  decoding="async"
                  className="h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {shot.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#09090b] via-transparent to-transparent">
                    <p className="text-xs text-white/70">{shot.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-16 py-20 text-center">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-xs uppercase tracking-wider text-white/90 transition hover:border-acid/60 hover:text-acid"
        >
          <ArrowLeft size={14} />
          Kembali ke semua proyek
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 px-6 sm:px-16 mt-16 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            <span>{config.html.fullName}</span>
          </div>
          <div>© {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
      </div>
    </ContentProvider>
  );
};

export default ProjectDetailPage;