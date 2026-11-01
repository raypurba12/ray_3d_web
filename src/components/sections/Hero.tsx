import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowUpRight, Download, Terminal, MousePointer } from "lucide-react";
import { styles } from "../../constants/styles";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { trackCvDownload } from "../../features/portfolio/tracking";
import { Magnetic } from "../atoms/Magnetic";

const Hero3DCanvas = lazy(() => import("../canvas/Hero3D"));

const INTERACTION_EVENTS = [
  "pointerdown",
  "touchstart",
  "keydown",
  "wheel",
] as const;

const useDeferredHero3D = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    if (reduceMotion || connection?.saveData) return;

    const activate = () => setEnabled(true);
    INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, activate, { once: true, passive: true })
    );

    return () =>
      INTERACTION_EVENTS.forEach((event) =>
        window.removeEventListener(event, activate)
      );
  }, []);

  return enabled;
};

const Hero = () => {
  const { profile, site, status } = usePortfolioContent();
  const show3D = useDeferredHero3D();

  return (
    <section
      id="top"
      className="hero-screen relative mx-auto w-full flex flex-col justify-between overflow-hidden bg-primary pt-24 pb-10 sm:pt-28 sm:pb-12"
    >
      {/* Loaded after first interaction so WebGL never delays first paint. */}
      {show3D && (
        <Suspense fallback={null}>
          <Hero3DCanvas
            identity={{
              name: profile.name,
              tagline: profile.tagline,
              avatarUrl: profile.avatar,
            }}
          />
        </Suspense>
      )}

      {/* Hero Foreground Content */}
      <div className={`relative z-10 mx-auto max-w-7xl w-full ${styles.paddingX} flex-1 flex flex-col justify-center pointer-events-none`}>
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md w-fit mb-6 pointer-events-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-acid"></span>
          </span>
          <span className="font-mono text-[11px] text-white/90 font-medium tracking-wide sm:text-xs">
            {site.hero.badge}
          </span>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl">
          <p className="font-mono text-xs sm:text-sm text-acid uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
            <Terminal size={14} className="text-acid" />
            <span>{site.hero.eyebrow}</span>
          </p>
          <h1 className={`${styles.heroHeadText}`}>
            {site.hero.title} <br className="hidden sm:inline" />
            <span className="acid-gradient-text">{site.hero.titleAccent}</span>
          </h1>
          <p className={`${styles.heroSubText} text-white/70 mt-5`}>
            Hi, I'm <strong className="text-white font-semibold">{profile.name || config.hero.name}</strong>. {site.hero.intro}
          </p>
        </div>

        {/* Interactive Action CTAs */}
        <div className="flex flex-col items-stretch gap-3 mt-8 pointer-events-auto xs:flex-row xs:flex-wrap xs:items-center xs:gap-4">
          <Magnetic className="w-full xs:w-auto">
            <a
              href="#work"
              className="group relative inline-flex w-full xs:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-acid transition-all duration-300 shadow-glow"
            >
              <span>Explore Works</span>
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Magnetic>

          <Magnetic className="w-full xs:w-auto">
            <a
              href="#contact"
              className="inline-flex w-full xs:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 text-white font-medium text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
            >
              <span>Initiate Contact</span>
            </a>
          </Magnetic>

          {profile.resumeUrl ? (
            <Magnetic className="w-full xs:w-auto">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCvDownload()}
                className="inline-flex w-full xs:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 hover:border-acid/60 text-white font-medium text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
              >
                <Download size={16} />
                <span>Download CV</span>
              </a>
            </Magnetic>
          ) : status === "loading" ? (
            <span aria-hidden className="invisible w-full xs:w-auto">
              <span className="inline-flex w-full xs:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-sm font-medium">
                <Download size={16} />
                <span>Download CV</span>
              </span>
            </span>
          ) : null}

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-white/50">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">K</kbd>
            <span className="ml-1 text-white/60">Command menu</span>
          </div>
        </div>
      </div>

      {/* Minimalist Bottom Bar: Interactive Cue & Scroll Indicator */}
      <div className={`relative z-10 mx-auto max-w-7xl w-full ${styles.paddingX} flex items-center justify-between gap-4 pointer-events-none mt-6 sm:mt-8`}>
        <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] sm:text-xs">
          <MousePointer size={12} className="shrink-0 text-acid" />
          <span>
            <span className="hidden sm:inline">Interactive 3D Canvas • Move cursor to interact</span>
            <span className="sm:hidden">Touch & drag to explore the 3D layer</span>
          </span>
        </div>

        <a
          href="#about"
          className="group pointer-events-auto flex items-center gap-3 text-white/50 hover:text-white transition-colors"
        >
          <span className="font-mono text-[11px] tracking-widest uppercase">Scroll</span>
          <div className="w-8 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-acid transition-all duration-300" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
