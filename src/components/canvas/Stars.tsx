import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import { random } from "maath";
import * as THREE from "three";

import { useInViewActive } from "../../hooks/useInViewActive";
import { useIsMobile } from "../../hooks/useMediaQuery";

const Stars = ({ count = 1600 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(
    () =>
      random.inSphere(new Float32Array(count * 3), {
        radius: 1.2,
      }) as Float32Array,
    [count]
  );

  useFrame((state, delta) => {
    if (ref.current) {
      const { x, y } = state.pointer;

      // Base rotation
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;

      // Mouse influence (subtle parallax)
      ref.current.rotation.x += y * 0.0002;
      ref.current.rotation.y += x * 0.0003;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#d4ff00"
          size={0.0025}
          sizeAttenuation
          opacity={0.35}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  const isMobile = useIsMobile();
  const { ref, active } = useInViewActive<HTMLDivElement>("200px");

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-[-1] w-full"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <Stars count={isMobile ? 600 : 1600} />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;
