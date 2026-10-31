import { motion } from "framer-motion";
import { ArrowUpRight, Download, Terminal, MousePointer } from "lucide-react";
import { styles } from "../../constants/styles";
import { Hero3DCanvas } from "../canvas";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { trackCvDownload } from "../../features/portfolio/tracking";
import { Magnetic } from "../atoms/Magnetic";

const Hero = () => {
  const { profile } = usePortfolioContent();

  return (
    <section
      id="top"
      className="relative mx-auto min-h-screen w-full flex flex-col justify-between overflow-hidden bg-primary pt-28 pb-12"
    >
      {/* Dynamic 3D WebGL Canvas Layer */}
      <Hero3DCanvas
        identity={{
          name: profile.name,
          tagline: profile.tagline,
          avatarUrl: profile.avatar,
        }}
      />

      {/* Hero Foreground Content */}
      <div className={`relative z-10 mx-auto max-w-7xl w-full ${styles.paddingX} flex-1 flex flex-col justify-center pointer-events-none`}>
        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md w-fit mb-6 pointer-events-auto"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-acid"></span>
          </span>
          <span className="font-mono text-xs text-white/90 font-medium tracking-wide">
            Available for new projects & creative roles
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl"
        >
          <p className="font-mono text-xs sm:text-sm text-acid uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
            <Terminal size={14} className="text-acid" />
            <span>Creative Developer & WebGL Architect</span>
          </p>
          <h1 className={`${styles.heroHeadText}`}>
            Transforming ideas into <br className="hidden sm:inline" />
            <span className="acid-gradient-text">spatial digital experiences.</span>
          </h1>
          <p className={`${styles.heroSubText} text-white/70 mt-5`}>
            Hi, I'm <strong className="text-white font-semibold">{profile.name || config.hero.name}</strong>. {config.hero.p[0]} {config.hero.p[1]}
          </p>
        </motion.div>

        {/* Interactive Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex flex-wrap items-center gap-4 mt-8 pointer-events-auto"
        >
          <Magnetic>
            <a
              href="#work"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-acid transition-all duration-300 shadow-glow"
            >
              <span>Explore Works</span>
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Magnetic>

          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 text-white font-medium text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
            >
              <span>Initiate Contact</span>
            </a>
          </Magnetic>

          {profile.resumeUrl && (
            <Magnetic>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCvDownload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 hover:border-acid/60 text-white font-medium text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
              >
                <Download size={16} />
                <span>Download CV</span>
              </a>
            </Magnetic>
          )}

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 border border-white/5 font-mono text-xs text-white/50">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">K</kbd>
            <span className="ml-1 text-white/60">Command menu</span>
          </div>
        </motion.div>
      </div>

      {/* Minimalist Bottom Bar: Interactive Cue & Scroll Indicator */}
      <div className={`relative z-10 mx-auto max-w-7xl w-full ${styles.paddingX} flex items-center justify-between pointer-events-none mt-8`}>
        <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
          <MousePointer size={12} className="text-acid" />
          <span>Interactive 3D Canvas • Move cursor to interact</span>
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
