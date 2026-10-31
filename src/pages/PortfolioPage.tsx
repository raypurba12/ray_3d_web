import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";

import {
  About,
  Contact,
  Experience,
  Feedbacks,
  Gallery,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
  CommandMenu,
} from "../components";
import { CustomCursor } from "../components/layout/CustomCursor";
import { config } from "../constants/config";
import { ContentProvider } from "../features/portfolio/ContentProvider";
import { usePortfolioContent } from "../features/portfolio/content-context";
import { trackPageView } from "../features/portfolio/tracking";
import { registerLenis, scrollToId } from "../utils/scrollTo";

const PortfolioFooter = () => {
  const { profile } = usePortfolioContent();

  return (
    <footer className="relative z-10 border-t border-white/5 py-10 px-6 sm:px-16 mt-16 bg-[#09090b]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/40">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-acid" />
          <span>{profile.name || "Ray Purba"} Portfolio Architecture</span>
        </div>
        <div>
          Designed & engineered with React, Three.js, and TypeScript.
        </div>
        <div>© {new Date().getFullYear()} All rights reserved.</div>
      </div>
    </footer>
  );
};

const PortfolioPage = () => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    registerLenis(lenis);

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  useEffect(() => {
    document.title = config.html.title;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || href === "#") return;

      const id = decodeURIComponent(href.slice(1));
      if (id !== "top" && !document.getElementById(id)) return;

      event.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", href);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <div className="bg-primary text-white min-h-screen relative z-0 selection:bg-acid selection:text-black">
        <CustomCursor />

        {/* Global Navigation */}
        <Navbar />

        {/* Global Command Palette */}
        <CommandMenu
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
        />

        {/* Sections */}
        <Hero />
        <About />
        <Experience />
        <Tech />
        <Works />
        <Gallery />
        <Feedbacks />

        {/* Contact & Ambient Stars */}
        <div className="relative z-0">
          <Contact />
          <StarsCanvas />
        </div>

        {/* Minimalist Engineering Footer */}
        <PortfolioFooter />
        </div>
      </ContentProvider>
    </MotionConfig>
  );
};

export default PortfolioPage;
