import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Layers } from "lucide-react";

import { Navbar } from "../components";
import { CustomCursor } from "../components/layout/CustomCursor";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import { config } from "../constants/config";
import { site } from "../constants/site";
import { ContentProvider } from "../features/portfolio/ContentProvider";
import { usePortfolioContent } from "../features/portfolio/content-context";

const ProjectsFooter = () => (
  <footer className="relative z-10 mt-16 border-t border-white/5 py-10 px-6 sm:px-16 bg-[#09090b]/80 backdrop-blur-md">
    <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/40">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-acid" />
        <span>{site.name} Portfolio Architecture</span>
      </div>
      <div>Designed &amp; engineered with React, Three.js, and TypeScript.</div>
      <div>© {new Date().getFullYear()} All rights reserved.</div>
    </div>
  </footer>
);

const ProjectsContent = () => {
  const { projects, status } = usePortfolioContent();

  return (
    <>
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-16 pt-32 sm:pt-36 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-white/50 transition hover:text-acid"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-acid">
              // Full Archive
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
              All Projects.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
              Every published project from the CMS, with screenshots, tech
              stack, demo videos, and source code links.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/70">
            <Layers size={13} className="text-acid" />
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-16">
        {projects.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={`project-${index}`}
                index={index}
                {...project}
              />
            ))}
          </motion.div>
        ) : status === "loading" ? (
          <div className="bento-card rounded-2xl p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Syncing works from the CMS…
            </p>
          </div>
        ) : (
          <div className="bento-card rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-bold text-white">
              No projects published yet
            </p>
            <p className="mt-2 text-sm text-secondary">
              Projects will appear here once they are published from the CMS.
            </p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <a
            href="/#work"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-xs uppercase tracking-wider text-white/90 transition hover:border-acid/60 hover:text-acid"
          >
            Kembali ke beranda
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>

      <ProjectsFooter />
    </>
  );
};

const ProjectsPage = () => {
  useEffect(() => {
    document.title = `All Projects — ${config.html.fullName}`;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <div className="bg-primary text-white min-h-screen relative z-0 selection:bg-acid selection:text-black">
          <CustomCursor />
          <Navbar />
          <ProjectsContent />
        </div>
      </ContentProvider>
    </MotionConfig>
  );
};

export default ProjectsPage;
