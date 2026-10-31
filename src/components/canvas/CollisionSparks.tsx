import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Spark {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface CollisionSparksHandle {
  spawn: (x: number, y: number) => void;
}

const MAX_SPARKS = 120;

export const CollisionSparks = forwardRef<CollisionSparksHandle>((_props, ref) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const sparks = useRef<Spark[]>([]);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(MAX_SPARKS * 3), []);
  const opacities = useMemo(() => new Float32Array(MAX_SPARKS), []);

  useMemo(() => {
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
  }, [geometry, positions, opacities]);

  useImperativeHandle(ref, () => ({
    spawn: (x: number, y: number) => {
      // Spawn 8-12 sparks at collision point
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        if (sparks.current.length >= MAX_SPARKS) break;

        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 0.08 + Math.random() * 0.12;
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 0.02
        );

        sparks.current.push({
          pos: new THREE.Vector3(x, y, 0.2),
          vel: velocity,
          life: 1.0,
          maxLife: 0.4 + Math.random() * 0.3,
        });
      }
    },
  }));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);

    // Update sparks
    for (let i = sparks.current.length - 1; i >= 0; i--) {
      const spark = sparks.current[i];
      spark.pos.add(spark.vel);
      spark.vel.multiplyScalar(0.92); // Damping
      spark.vel.y -= 0.006; // Gravity
      spark.life -= dt;

      if (spark.life <= 0) {
        sparks.current.splice(i, 1);
      }
    }

    // Update geometry
    for (let i = 0; i < MAX_SPARKS; i++) {
      if (i < sparks.current.length) {
        const spark = sparks.current[i];
        positions[i * 3] = spark.pos.x;
        positions[i * 3 + 1] = spark.pos.y;
        positions[i * 3 + 2] = spark.pos.z;
        opacities[i] = (spark.life / spark.maxLife) * 0.9;
      } else {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        opacities[i] = 0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#d4ff00"
        transparent
        vertexColors={false}
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

CollisionSparks.displayName = "CollisionSparks";

export default CollisionSparks;
