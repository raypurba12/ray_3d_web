import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

const MAX_PARTICLES = 60;
const SPAWN_RATE = 0.08;

export const ParticleTrail = () => {
  const particlesRef = useRef<THREE.Points>(null!);
  const particles = useRef<Particle[]>([]);
  const lastMouseRef = useRef(new THREE.Vector3());
  const spawnAccum = useRef(0);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);
  const opacities = useMemo(() => new Float32Array(MAX_PARTICLES), []);

  useMemo(() => {
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
  }, [geometry, positions, opacities]);

  useFrame((state) => {
    const { pointer, camera } = state;
    const dt = state.clock.getDelta();

    // Convert NDC to world coordinates at z=0
    const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const worldMouse = camera.position.clone().add(dir.multiplyScalar(dist));

    // Check mouse movement
    const mouseDelta = worldMouse.distanceTo(lastMouseRef.current);
    
    if (mouseDelta > 0.01) {
      spawnAccum.current += mouseDelta;
      
      // Spawn new particles based on movement
      while (spawnAccum.current > SPAWN_RATE && particles.current.length < MAX_PARTICLES) {
        spawnAccum.current -= SPAWN_RATE;
        
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.005
        );
        
        particles.current.push({
          pos: worldMouse.clone(),
          vel: velocity,
          life: 1.0,
          maxLife: 0.8 + Math.random() * 0.4,
        });
      }
      
      lastMouseRef.current.copy(worldMouse);
    }

    // Update existing particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.pos.add(p.vel);
      p.vel.multiplyScalar(0.96); // Damping
      p.life -= dt;

      if (p.life <= 0) {
        particles.current.splice(i, 1);
      }
    }

    // Update geometry
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (i < particles.current.length) {
        const p = particles.current[i];
        positions[i * 3] = p.pos.x;
        positions[i * 3 + 1] = p.pos.y;
        positions[i * 3 + 2] = p.pos.z;
        opacities[i] = (p.life / p.maxLife) * 0.8;
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
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#d4ff00"
        transparent
        vertexColors={false}
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleTrail;
