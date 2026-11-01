import { lazy, Suspense } from "react";
import { MousePointer } from "lucide-react";

import { DeferredCanvas } from "../canvas/DeferredCanvas";
import { SectionWrapper } from "../../hoc";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { useFinePointer } from "../../hooks/useMediaQuery";
import { Header } from "../atoms/Header";

const TechCanvas = lazy(() => import("../canvas/TechCanvas"));

const Tech = () => {
  const finePointer = useFinePointer();
  const { technologies, site, status } = usePortfolioContent();

  return (
    <>
      <Header
        useMotion={true}
        p={site.sections.tech.label}
        h2={site.sections.tech.title}
      />

      <div className="mt-3 flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-secondary text-sm sm:text-base leading-relaxed">
          The languages, frameworks, and infrastructure I use daily to ship
          production interfaces and real-time 3D experiences.
        </p>
        {finePointer && (
          <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <MousePointer size={12} className="text-acid" />
            <span>Drag the chips</span>
          </span>
        )}
      </div>

      {technologies.length > 0 ? (
        <DeferredCanvas
          className="mt-10 h-[380px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] sm:h-[460px] lg:h-[520px]"
          skipWhenReducedMotion={false}
        >
          <Suspense fallback={null}>
            <TechCanvas technologies={technologies} />
          </Suspense>
        </DeferredCanvas>
      ) : (
        <div className="mt-10 flex h-[220px] w-full items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.015] px-6 text-center">
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            {status === "loading"
              ? "Syncing tech stack…"
              : "The tech stack is being updated. Check back soon."}
          </p>
        </div>
      )}
    </>
  );
};

export default SectionWrapper(Tech, "tech");
