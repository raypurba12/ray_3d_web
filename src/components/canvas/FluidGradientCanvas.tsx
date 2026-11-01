import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { DeferredCanvas } from "./DeferredCanvas";
import { FluidGradient } from "./FluidGradient";
import { useIsMobile } from "../../hooks/useMediaQuery";

export const FluidGradientCanvas = () => {
  const isMobile = useIsMobile();

  return (
    <DeferredCanvas className="absolute inset-0 h-full w-full" rootMargin="200px">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <FluidGradient />
        </Suspense>
      </Canvas>
    </DeferredCanvas>
  );
};

export default FluidGradientCanvas;
