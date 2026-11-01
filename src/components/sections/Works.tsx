import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import Tilt from "react-parallax-tilt";

import { github } from "../../assets";
import { SectionWrapper } from "../../hoc";
import { fadeIn } from "../../utils/motion";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { Header } from "../atoms/Header";
import { parseVideoSource, type VideoSource } from "../../lib/video";
import { TProject, TProjectImage } from "../../types";

const lightboxButtonClass =
  "absolute z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white";

const ScreenshotLightbox = ({
  images,
  index,
  onClose,
  onChange,
}: {
  images: TProjectImage[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) => {
  const active = images[index];

  const showPrev = useCallback(
    () => onChange((index - 1 + images.length) % images.length),
    [index, images.length, onChange]
  );

  const showNext = useCallback(
    () => onChange((index + 1) % images.length),
    [index, images.length, onChange]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, showPrev, showNext]);

  if (!active) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.caption || "Project screenshot"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close screenshots"
        onClick={onClose}
        className={`${lightboxButtonClass} right-4 top-4`}
      >
        <X size={18} />
      </button>

      <button
        type="button"
        aria-label="Previous screenshot"
        onClick={(event) => {
          event.stopPropagation();
          showPrev();
        }}
        className={`${lightboxButtonClass} left-2 top-1/2 -translate-y-1/2 sm:left-6`}
      >
        <ChevronLeft size={20} />
      </button>

      <figure
        className="max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={active.image}
          alt={active.caption || "Project screenshot"}
          decoding="async"
          className="mx-auto max-h-[80vh] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
        />
        <figcaption className="mt-4 text-center font-mono text-xs text-white/50">
          {active.caption && (
            <span className="mr-2 text-white/90">{active.caption}</span>
          )}
          <span>
            {index + 1} / {images.length}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        aria-label="Next screenshot"
        onClick={(event) => {
          event.stopPropagation();
          showNext();
        }}
        className={`${lightboxButtonClass} right-2 top-1/2 -translate-y-1/2 sm:right-6`}
      >
        <ChevronRight size={20} />
      </button>
    </div>,
    document.body
  );
};

const ProjectVideoModal = ({
  name,
  source,
  poster,
  onClose,
}: {
  name: string;
  source: VideoSource;
  poster?: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} demo video`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close demo video"
        onClick={onClose}
        className={`${lightboxButtonClass} right-4 top-4`}
      >
        <X size={18} />
      </button>

      <figure className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
          {source.kind === "file" ? (
            <video
              src={source.url}
              poster={poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            />
          ) : (
            <iframe
              src={source.embedUrl}
              title={`${name} demo video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              className="aspect-video w-full"
            />
          )}
        </div>
        <figcaption className="mt-4 text-center font-mono text-xs text-white/50">
          {name} — demo video
        </figcaption>
      </figure>
    </div>,
    document.body
  );
};

const ProjectCard: React.FC<{ index: number } & TProject> = ({
  index,
  name,
  description,
  tags,
  image,
  sourceCodeLink,
  liveDemoLink,
  videoLink,
  metric,
  images,
  featured,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const screenshots = images ?? [];
  const videoSource = videoLink ? parseVideoSource(videoLink) : null;

  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.15, 0.75)}>
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        scale={1.02}
        transitionSpeed={400}
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="#d4ff00"
        glarePosition="all"
        glareBorderRadius="16px"
        className="bento-card group rounded-2xl overflow-hidden flex flex-col justify-between"
      >
        {/* Visual Preview / Thumbnail Area */}
        <div className="relative h-[220px] sm:h-[240px] w-full overflow-hidden bg-black/40">
          {/* Static Image */}
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-white/[0.08] to-transparent" />
          )}

          {/* Ambient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/20 pointer-events-none" />

          {/* Hover light sweep */}
          <div
            className="works-shine pointer-events-none absolute inset-0 z-[1]"
            aria-hidden="true"
          />

          {videoSource && (
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label={`Play ${name} demo video`}
              className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full border border-acid/40 bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-acid backdrop-blur-md transition hover:scale-105 hover:bg-acid hover:text-black"
            >
              <Play size={11} className="fill-current" />
              Demo video
            </button>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
            {featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-acid/40 bg-acid/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-acid backdrop-blur-md">
                <Sparkles size={11} />
                Featured
              </span>
            )}
            {metric && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#09090b]/80 px-3 py-1 font-mono text-[10px] text-white/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                <span>{metric}</span>
              </span>
            )}
          </div>

          {/* Action Link Icons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {screenshots.length > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                aria-label={`View ${screenshots.length} screenshots`}
                className="px-2.5 py-2 rounded-full bg-[#09090b]/80 border border-white/10 hover:border-acid/50 backdrop-blur-md transition-all flex items-center justify-center gap-1 h-8 font-mono text-[10px] text-white/90"
              >
                <Camera size={13} />
                <span>{screenshots.length}</span>
              </button>
            )}
            {sourceCodeLink && (
              <a
                href={sourceCodeLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-[#09090b]/80 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all flex items-center justify-center w-8 h-8"
                aria-label="View Source Code"
              >
                <img src={github} alt="github" className="w-4 h-4 object-contain" />
              </a>
            )}
            {liveDemoLink && (
              <a
                href={liveDemoLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-acid text-black font-semibold hover:bg-white transition-all shadow-glow"
                aria-label="View Live Project"
              >
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Content & Narrative */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-white group-hover:text-acid transition-colors">
              {name}
            </h3>
            <p className="text-secondary text-xs sm:text-sm mt-2.5 leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>

          {/* Tech Tags */}
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isHex = tag.color.startsWith("#");
              return (
                <span
                  key={tag.name}
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-white/[0.03] border border-white/5 transition-colors group-hover:border-white/10 ${isHex ? "" : tag.color}`}
                  style={isHex ? { color: tag.color } : undefined}
                >
                  #{tag.name}
                </span>
              );
            })}
          </div>
        </div>
      </Tilt>

      {lightboxIndex !== null && (
        <ScreenshotLightbox
          images={screenshots}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}

      {videoOpen && videoSource && (
        <ProjectVideoModal
          name={name}
          source={videoSource}
          poster={image || undefined}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </motion.div>
  );
};

const Works = () => {
  const { projects, status } = usePortfolioContent();

  return (
    <>
      <Header useMotion={true} {...config.sections.works} />

      <div className="flex w-full">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="text-secondary mt-3 max-w-3xl text-sm sm:text-base leading-relaxed"
        >
          {config.sections.works.content}
        </motion.p>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={`project-${index}`} index={index} {...project} />
          ))}
        </div>
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
