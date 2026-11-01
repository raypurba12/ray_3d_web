import { lazy, Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Sparkles,
  Zap,
  Globe2,
  Clock,
  Terminal,
  CheckCircle2,
} from "lucide-react";

import { SectionWrapper } from "../../hoc";
import { fadeIn } from "../../utils/motion";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { Header } from "../atoms/Header";

const AmbientGeometryCanvas = lazy(
  () => import("../canvas/AmbientGeometry")
);

const About = () => {
  const [time, setTime] = useState("");
  const { profile, technologies } = usePortfolioContent();

  const initials =
    (profile.name || "Ray Purba")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "RP";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <Suspense fallback={null}>
          <AmbientGeometryCanvas />
        </Suspense>
      </div>

      <Header useMotion={true} {...config.sections.about} />

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="text-secondary mt-3 max-w-3xl text-sm sm:text-base leading-relaxed"
      >
        {profile.bio || config.sections.about.content}
      </motion.p>

      {/* Bento Grid Architecture */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-5"
      >
        {/* Bento 1: Primary Discipline & Architecture (Span 2) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
            },
          }}
          className="bento-card md:col-span-2 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-acid/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-acid uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} />
                <span>01 // Core Philosophy</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-white/70">
                Design Engineering
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bridging mathematical 3D graphics with human-centric interfaces.
            </h3>
            <p className="text-secondary text-sm sm:text-base mt-3 leading-relaxed">
              I reject generic template assembly in favor of purposeful digital craft.
              Every interaction is tuned for tactile feedback, spatial depth, and buttery 60 FPS performance across modern viewports.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 font-mono text-xs text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-acid" />
              <span>Three.js / WebGL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-acid" />
              <span>React 18 & TS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-acid" />
              <span>Shader Math</span>
            </div>
          </div>
        </motion.div>

        {/* Bento 2: Performance Standards (Span 1) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
            },
          }}
          className="bento-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <span className="font-mono text-xs text-acid uppercase tracking-widest flex items-center gap-2 mb-4">
              <Zap size={14} />
              <span>02 // Standards</span>
            </span>
            <h3 className="font-display text-lg font-bold text-white">
              Zero Slop Benchmarks
            </h3>
            <p className="text-secondary text-xs mt-2">
              Measurable criteria powering every production build.
            </p>
          </div>

          <div className="space-y-3 my-4 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-white/60">FPS Target</span>
              <span className="text-acid font-bold">60 FPS</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-white/60">Accessibility</span>
              <span className="text-white font-bold">Keyboard Ready</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-white/60">Type Safety</span>
              <span className="text-white font-bold">Strict TS</span>
            </div>
          </div>

          <div className="font-mono text-[10px] text-white/40 flex items-center gap-1.5">
            <Sparkles size={11} className="text-acid" />
            <span>Audited with Lighthouse & WebGL Profiler</span>
          </div>
        </motion.div>

        {/* Bento 3: Live Timezone & Operating Status (Span 1) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
            },
          }}
          className="bento-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-acid uppercase tracking-widest flex items-center gap-2">
                <Globe2 size={14} />
                <span>03 // Location</span>
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {profile.location || "Jakarta, Indonesia (WIB)"}
            </h3>
            <div className="mt-3 flex items-center gap-2 font-mono text-2xl font-bold text-white tracking-wider">
              <Clock size={18} className="text-acid" />
              <span>{time || "23:00:00"}</span>
            </div>
          </div>

          <p className="text-secondary text-xs mt-4 border-t border-white/5 pt-3">
            Open to remote international collaboration across all global timezones.
          </p>
        </motion.div>

        {/* Bento 4: Interactive Architecture Stack (Span 3) */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
            },
          }}
          className="bento-card md:col-span-3 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <span className="font-mono text-xs text-acid uppercase tracking-widest flex items-center gap-2 mb-3">
              <Terminal size={14} />
              <span>04 // Tech Ecosystem</span>
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              Production-Proven Tooling & Libraries
            </h3>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Curated stack focused on developer velocity, type safety, and real-time GPU rendering.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {technologies.length > 0 ? (
              technologies.map((tech) => (
                <span
                  key={tech.name}
                  className="group relative px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-acid/50 hover:bg-white/[0.08] font-mono text-xs text-white/90 transition-all cursor-default"
                  title={tech.category}
                >
                  {tech.name}
                  {tech.category && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/95 border border-acid/30 backdrop-blur-sm text-[10px] text-white/90 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                      {tech.category}
                    </span>
                  )}
                </span>
              ))
            ) : (
              <span className="font-mono text-xs text-white/40">
                The tech ecosystem will appear here once published from the CMS.
              </span>
            )}
          </div>
        </motion.div>

        {/* Bento 5: Portrait */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
              },
            },
          }}
          className="bento-card group relative min-h-[320px] overflow-hidden rounded-2xl md:min-h-0"
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name || "Portrait"}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-acid/20 via-white/[0.04] to-transparent font-display text-6xl font-bold tracking-tight text-white/80">
              {initials}
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
              05 // Portrait
            </span>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              {profile.name || "Ray Purba"}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
              {profile.tagline}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SectionWrapper(About, "about");
