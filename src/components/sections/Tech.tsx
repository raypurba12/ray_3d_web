import { MousePointer } from "lucide-react";

import { TechCanvas } from "../canvas";
import { SectionWrapper } from "../../hoc";
import { config } from "../../constants/config";
import { usePortfolioContent } from "../../features/portfolio/content-context";
import { useFinePointer } from "../../hooks/useMediaQuery";
import { Header } from "../atoms/Header";

const Tech = () => {
  const finePointer = useFinePointer();
  const { technologies } = usePortfolioContent();

  return (
    <>
      <Header useMotion={true} {...config.sections.tech} />

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
        <div className="mt-10 h-[380px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] sm:h-[460px] lg:h-[520px]">
          <TechCanvas technologies={technologies} />
        </div>
      ) : (
        <div className="mt-10 flex h-[220px] w-full items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.015] px-6 text-center">
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            The tech stack is being updated. Check back soon.
          </p>
        </div>
      )}
    </>
  );
};

export default SectionWrapper(Tech, "tech");
