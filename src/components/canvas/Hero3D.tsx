import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

import { useInViewActive } from "../../hooks/useInViewActive";
import {
  useFinePointer,
  useIsMobile,
  useIsWideViewport,
} from "../../hooks/useMediaQuery";
import { Lanyard, type LanyardIdentity } from "./Lanyard";
import { ParticleTrail } from "./ParticleTrail";

// Floating ambient particle dust in 3D space
const AmbientParticles = ({ count = 80 }: { count?: number }) => {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 14;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 12;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d4ff00"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

// Wireframe crystalline icosahedron core — transparent, geometric, futuristic
const CrystalCore = () => {
  const wireRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const hoverIntensity = useRef(0);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    // Detect hover (if pointer near center)
    const dist = Math.sqrt(x * x + y * y);
    const targetHover = dist < 0.3 ? 1 : 0;
    hoverIntensity.current = THREE.MathUtils.lerp(
      hoverIntensity.current,
      targetHover,
      0.08
    );

    if (wireRef.current) {
      wireRef.current.rotation.x = THREE.MathUtils.lerp(
        wireRef.current.rotation.x,
        y * 0.3 + t * 0.08,
        0.04
      );
      wireRef.current.rotation.y = THREE.MathUtils.lerp(
        wireRef.current.rotation.y,
        x * 0.4 + t * 0.12,
        0.04
      );

      // Pulse on hover
      const hoverScale = 1.6 + hoverIntensity.current * 0.12;
      wireRef.current.scale.setScalar(hoverScale);
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(
        innerRef.current.rotation.x,
        -y * 0.2 + t * 0.1,
        0.03
      );
      innerRef.current.rotation.y = THREE.MathUtils.lerp(
        innerRef.current.rotation.y,
        -x * 0.3 + t * 0.15,
        0.03
      );
    }

    if (glowRef.current) {
      const scale = 1.6 + Math.sin(t * 0.8) * 0.08 + hoverIntensity.current * 0.4;
      glowRef.current.scale.setScalar(scale);

      // Intensify glow on hover
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + hoverIntensity.current * 0.08;
    }
  });

  return (
    <group>
      {/* Outer wireframe icosahedron — the main visible crystal */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.0}>
        <mesh ref={wireRef} scale={1.6}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#d4ff00"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Inner smaller wireframe — creates depth illusion */}
      <Float speed={2.0} rotationIntensity={0.8} floatIntensity={0.8}>
        <mesh ref={innerRef} scale={1.0}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#00f5a0"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </Float>

      {/* Soft ambient glow sphere behind the crystal */}
      <mesh ref={glowRef} scale={1.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#d4ff00"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Tiny bright center point */}
      <mesh scale={0.06}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Small wireframe shards orbiting the crystal at different depths
const OrbitingShards = ({ count = 7 }: { count?: number }) => {
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        radius: 2.9 + (index % 3) * 0.45,
        speed: 0.08 + (index % 4) * 0.02,
        offset: (index / count) * Math.PI * 2,
        tilt: (index % 2 === 0 ? 1 : -1) * (0.4 + (index % 3) * 0.2),
        size: 0.07 + (index % 3) * 0.025,
        color: index % 3 === 0 ? "#00f5a0" : "#d4ff00",
        spin: 0.4 + (index % 4) * 0.15,
      })),
    [count]
  );

  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    shards.forEach((shard, index) => {
      const mesh = refs.current[index];
      if (!mesh) return;

      const angle = shard.offset + t * shard.speed;
      mesh.position.set(
        Math.cos(angle) * shard.radius,
        Math.sin(angle * 1.3) * 0.7 + shard.tilt,
        Math.sin(angle) * shard.radius * 0.65
      );
      mesh.rotation.x = t * shard.spin;
      mesh.rotation.y = t * shard.spin * 0.7;
    });
  });

  return (
    <group>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          scale={shard.size}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={shard.color}
            wireframe
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}
    </group>
  );
};

// Camera drifts with page scroll for a parallax depth effect inside the hero
const ScrollParallaxRig = ({ enabled = true }: { enabled?: boolean }) => {
  useFrame((state) => {
    if (!enabled) return;

    const viewportHeight = window.innerHeight || 1;
    const progress = Math.min(window.scrollY / viewportHeight, 1);
    const { x } = state.pointer;

    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      progress * 0.9,
      0.06
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      5.5 + progress * 1.1,
      0.06
    );
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      x * 0.12,
      0.04
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

// Orbital rings around the crystal
const OrbitalRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = THREE.MathUtils.lerp(
        ring1Ref.current.rotation.x,
        -y * 0.2 + Math.PI / 2.5 + Math.sin(t * 0.3) * 0.1,
        0.03
      );
      ring1Ref.current.rotation.y = THREE.MathUtils.lerp(
        ring1Ref.current.rotation.y,
        -x * 0.3 + t * 0.15,
        0.03
      );
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = t * 0.2;
      ring2Ref.current.rotation.x = Math.PI / 3 + x * 0.15;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -t * 0.18;
      ring3Ref.current.rotation.x = Math.PI / 4.5 + y * 0.1;
    }
  });

  return (
    <group>
      {/* Primary orbital ring */}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.9}>
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.4, 0.012, 16, 100]} />
          <meshBasicMaterial color="#d4ff00" transparent opacity={0.7} />
        </mesh>
      </Float>

      {/* Secondary ring — different angle */}
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={0.7}>
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.0, 0.008, 16, 80]} />
          <meshBasicMaterial color="#00f5a0" transparent opacity={0.4} />
        </mesh>
      </Float>

      {/* Tertiary subtle ring */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={ring3Ref}>
          <torusGeometry args={[2.8, 0.006, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
      </Float>
    </group>
  );
};

export const Hero3DCanvas: React.FC<{ identity: LanyardIdentity }> = ({
  identity,
}) => {
  const isMobile = useIsMobile();
  const isWideViewport = useIsWideViewport();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const { ref, active } = useInViewActive<HTMLDivElement>("100px");

  const showLanyard = isWideViewport && finePointer && !reducedMotion;

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none lg:pointer-events-auto"
      style={{ touchAction: "pan-y" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={isMobile ? [1, 1.35] : [1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent", touchAction: "pan-y" }}
      >
        <AmbientParticles count={isMobile ? 40 : 80} />
        <CrystalCore />
        <OrbitalRings />
        <OrbitingShards count={isMobile ? 4 : 7} />
        <ScrollParallaxRig enabled={!reducedMotion} />
        {showLanyard && (
          <Lanyard anchor={[2.45, 2.65]} identity={identity} />
        )}
        {!isMobile && !reducedMotion && <ParticleTrail />}
      </Canvas>
    </div>
  );
};

export default Hero3DCanvas;
