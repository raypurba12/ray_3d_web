import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";

import { useInViewActive } from "../../hooks/useInViewActive";
import { useIsMobile } from "../../hooks/useMediaQuery";
import type { TTechnology } from "../../types";
import { TechBadges } from "./TechBadges";
import { TechTextureBoundary } from "./TechTextureBoundary";

type TechCanvasProps = {
  technologies: TTechnology[];
};

export const TechCanvas = ({ technologies }: TechCanvasProps) => {
  const isMobile = useIsMobile();
  const { ref, active } = useInViewActive<HTMLDivElement>("150px");
  const signature = technologies
    .map((tech) => `${tech.name}:${tech.icon}`)
    .join("|");

  return (
    <div ref={ref} className="tech-canvas h-full w-full" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={isMobile ? [1, 1.35] : [1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ touchAction: "pan-y" }}
      >
        <Suspense fallback={null}>
          <TechTextureBoundary key={signature}>
            <TechBadges technologies={technologies} />
          </TechTextureBoundary>
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default TechCanvas;
