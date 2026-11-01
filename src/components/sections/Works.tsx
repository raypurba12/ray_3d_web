import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { SectionWrapper } from "../../hoc";
import { fadeIn } from "../../utils/motion";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { Header } from "../atoms/Header";
import { ProjectCard } from "../portfolio/ProjectCard";

export const HOME_PROJECT_LIMIT = 6;

const Works = () => {
  const { projects, site, status } = usePortfolioContent();
  const visibleProjects = projects.slice(0, HOME_PROJECT_LIMIT);
  const hasMore = projects.length > visibleProjects.length;

  return (
    <>
      <Header
        useMotion={true}
        p={site.sections.works.label}
        h2={site.sections.works.title}
      />

      <div className="flex w-full">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="text-secondary mt-3 max-w-3xl text-sm sm:text-base leading-relaxed"
        >
          {site.sections.works.content}
        </motion.p>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={`project-${index}`} index={index} {...project} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              to="/projects"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-xs uppercase tracking-wider text-white/90 transition hover:border-acid/60 hover:bg-acid hover:text-black"
            >
              {hasMore ? "Lihat semua proyek" : "Buka halaman proyek"}
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            {hasMore && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Menampilkan {visibleProjects.length} dari {projects.length} proyek
              </p>
            )}
          </div>
        </>
      ) : status === "loading" ? (
        <div className="bento-card mt-12 rounded-2xl p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Syncing works from the CMS…
          </p>
        </div>
      ) : (
        <div className="bento-card mt-12 rounded-2xl p-10 text-center">
          <p className="font-display text-lg font-bold text-white">
            No projects published yet
          </p>
          <p className="mt-2 text-sm text-secondary">
            Selected works will appear here once they are published from the
            CMS.
          </p>
        </div>
      )}
    </>
  );
};

export default SectionWrapper(Works, "work");
