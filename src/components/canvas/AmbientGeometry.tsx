import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

import { useInViewActive } from "../../hooks/useInViewActive";
import { useIsMobile } from "../../hooks/useMediaQuery";

const ShapeRig = ({
  isMobile,
  animate,
}: {
  isMobile: boolean;
  animate: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!animate) return;

    const t = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        x * 0.16,
        0.03
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -y * 0.1,
        0.03
      );
    }

    if (leftRef.current) {
      leftRef.current.rotation.x = t * 0.06;
      leftRef.current.rotation.y = t * 0.09;
    }

    if (rightRef.current) {
      rightRef.current.rotation.x = -t * 0.05;
      rightRef.current.rotation.y = -t * 0.07;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={leftRef}
        position={[-3.4, 1.6, -2]}
        scale={isMobile ? 0.9 : 1.15}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00f5a0" wireframe transparent opacity={0.09} />
      </mesh>

      <mesh
        ref={rightRef}
        position={[3.2, -1.4, -3]}
        scale={isMobile ? 0.7 : 1}
      >
        <torusKnotGeometry args={[0.9, 0.16, isMobile ? 48 : 80, 8]} />
        <meshBasicMaterial color="#d4ff00" wireframe transparent opacity={0.08} />
      </mesh>

      {!isMobile && (
        <mesh position={[2.6, 2.2, -1.5]} scale={0.35}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#d4ff00" wireframe transparent opacity={0.14} />
        </mesh>
      )}
    </group>
  );
};

export const AmbientGeometryCanvas = () => {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { ref, active } = useInViewActive<HTMLDivElement>("100px");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted, ref]);

  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          dpr={[1, isMobile ? 1 : 1.25]}
          frameloop={active && !reducedMotion ? "always" : "never"}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        >
          <ShapeRig isMobile={isMobile} animate={!reducedMotion} />
        </Canvas>
      )}
    </div>
  );
};

export default AmbientGeometryCanvas;
