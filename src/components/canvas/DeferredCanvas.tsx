import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type DeferredCanvasProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  skipWhenReducedMotion?: boolean;
};

export const DeferredCanvas = ({
  children,
  className,
  rootMargin = "300px",
  skipWhenReducedMotion = true,
}: DeferredCanvasProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inRange, setInRange] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (inRange) return;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setInRange(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInRange(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [inRange, rootMargin]);

  const renderCanvas = inRange && !(skipWhenReducedMotion && reducedMotion);

  return (
    <div ref={ref} className={className}>
      {renderCanvas ? (
        children
      ) : (
        <div
          aria-hidden
          className="h-full w-full bg-gradient-to-br from-white/[0.04] via-transparent to-acid/[0.04]"
        />
      )}
    </div>
  );
};

export default DeferredCanvas;
