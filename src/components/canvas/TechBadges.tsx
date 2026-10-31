import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

import type { TTechnology } from "../../types";
import { CollisionSparks, type CollisionSparksHandle } from "./CollisionSparks";

const BADGE_W = 1.9;
const BADGE_H = 1.2;
const BADGE_DEPTH = 0.12;
const GAP_X = 0.42;
const GAP_Y = 0.38;
const COLLISION_PAD = 0.05;
const DAMPING = 0.86;
const HOME_STIFFNESS = 0.065;
const MAX_SPEED = 0.6;

const LABEL_W = 512;
const LABEL_H = 96;
const labelCache = new Map<string, THREE.CanvasTexture>();

const createLabelTexture = (label: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;

  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, LABEL_W, LABEL_H);
    context.fillStyle = "#f4f4f5";
    context.font = '600 44px "Space Grotesk", "Plus Jakarta Sans", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label.toUpperCase(), LABEL_W / 2, LABEL_H / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const getLabelTexture = (label: string) => {
  const cached = labelCache.get(label);
  if (cached) return cached;

  const texture = createLabelTexture(label);
  labelCache.set(label, texture);
  return texture;
};

const emitCursor = (variant: "hover" | "default") => {
  window.dispatchEvent(
    new CustomEvent("cursor-variant", { detail: variant })
  );
};

interface BadgeBody {
  pos: THREE.Vector2;
  vel: THREE.Vector2;
  home: THREE.Vector2;
  halfW: number;
  halfH: number;
}

interface DragState {
  index: number;
  pointerId: number;
  offset: THREE.Vector2;
}

type TechBadgesProps = {
  technologies: TTechnology[];
};

export const TechBadges = ({ technologies }: TechBadgesProps) => {
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  const iconTextures = useTexture(technologies.map((tech) => tech.icon));

  const [, setFontTick] = useState(0);
  useEffect(() => {
    let mounted = true;
    document.fonts?.ready.then(() => {
      if (!mounted) return;
      labelCache.clear();
      setFontTick((tick) => tick + 1);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    iconTextures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [iconTextures]);

  const bodies = useMemo<BadgeBody[]>(
    () =>
      technologies.map(() => ({
        pos: new THREE.Vector2(),
        vel: new THREE.Vector2(),
        home: new THREE.Vector2(),
        halfW: BADGE_W / 2,
        halfH: BADGE_H / 2,
      })),
    [technologies]
  );

  const layout = useMemo(() => {
    const count = technologies.length;
    const columns = viewport.width >= 15 ? 5 : viewport.width >= 10 ? 4 : 3;
    const rows = Math.ceil(count / columns);
    const maxX = viewport.width / 2 - BADGE_W / 2 - 0.2;
    const maxY = viewport.height / 2 - BADGE_H / 2 - 0.2;

    const homes = technologies.map((_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const itemsInRow =
        row === rows - 1 ? count - row * columns : columns;
      const rowCenter = (itemsInRow - 1) / 2;

      const x = (column - rowCenter) * (BADGE_W + GAP_X);
      const y = ((rows - 1) / 2 - row) * (BADGE_H + GAP_Y);

      return new THREE.Vector2(
        THREE.MathUtils.clamp(x, -maxX, maxX),
        THREE.MathUtils.clamp(y, -maxY, maxY)
      );
    });

    return { homes };
  }, [technologies, viewport.width, viewport.height]);

  const initializedRef = useRef(false);
  useLayoutEffect(() => {
    layout.homes.forEach((home, index) => {
      const body = bodies[index];
      body.home.copy(home);
      if (!initializedRef.current) {
        body.pos.copy(home);
        body.vel.set(0, 0);
      }
    });
    initializedRef.current = true;
  }, [bodies, layout]);

  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const glowRefs = useRef<Array<THREE.Mesh | null>>([]);
  const dragRef = useRef<DragState | null>(null);
  const hoveredRef = useRef(-1);
  const glowIntensity = useRef<number[]>(technologies.map(() => 0));
  const sparksRef = useRef<CollisionSparksHandle>(null);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointerNdc = useMemo(() => new THREE.Vector2(), []);
  const pointerHit = useMemo(() => new THREE.Vector3(), []);

  const startDrag = (event: ThreeEvent<PointerEvent>, index: number) => {
    if (event.pointerType === "touch" || event.button !== 0) return;

    event.stopPropagation();
    const body = bodies[index];
    body.vel.set(0, 0);
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      offset: new THREE.Vector2(
        body.pos.x - event.point.x,
        body.pos.y - event.point.y
      ),
    };
    hoveredRef.current = index;
    emitCursor("hover");
  };

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      const rect = gl.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointerNdc, camera);

      if (!raycaster.ray.intersectPlane(plane, pointerHit)) return;

      const body = bodies[drag.index];
      const maxX = viewport.width / 2 - body.halfW - 0.1;
      const maxY = viewport.height / 2 - body.halfH - 0.1;

      body.pos.x = THREE.MathUtils.clamp(
        pointerHit.x + drag.offset.x,
        -maxX,
        maxX
      );
      body.pos.y = THREE.MathUtils.clamp(
        pointerHit.y + drag.offset.y,
        -maxY,
        maxY
      );
    };

    const endDrag = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      emitCursor(hoveredRef.current >= 0 ? "hover" : "default");
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current && event.pointerId !== dragRef.current.pointerId) {
        return;
      }
      endDrag();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", endDrag);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", endDrag);
    };
  }, [bodies, camera, gl, plane, pointerHit, pointerNdc, raycaster, viewport]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 1 / 30) * 60;
    const draggingIndex = dragRef.current?.index ?? -1;

    const halfViewW = viewport.width / 2;
    const halfViewH = viewport.height / 2;

    for (let index = 0; index < bodies.length; index++) {
      const body = bodies[index];
      if (index === draggingIndex) continue;

      body.vel.x += (body.home.x - body.pos.x) * HOME_STIFFNESS * step;
      body.vel.y += (body.home.y - body.pos.y) * HOME_STIFFNESS * step;
      body.vel.multiplyScalar(Math.pow(DAMPING, step));
      body.vel.x = THREE.MathUtils.clamp(body.vel.x, -MAX_SPEED, MAX_SPEED);
      body.vel.y = THREE.MathUtils.clamp(body.vel.y, -MAX_SPEED, MAX_SPEED);

      body.pos.addScaledVector(body.vel, step);
      body.pos.x = THREE.MathUtils.clamp(
        body.pos.x,
        -halfViewW + body.halfW + 0.1,
        halfViewW - body.halfW - 0.1
      );
      body.pos.y = THREE.MathUtils.clamp(
        body.pos.y,
        -halfViewH + body.halfH + 0.1,
        halfViewH - body.halfH - 0.1
      );
    }

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = b.pos.x - a.pos.x;
          const dy = b.pos.y - a.pos.y;
          const overlapX =
            a.halfW + b.halfW + COLLISION_PAD - Math.abs(dx);
          const overlapY =
            a.halfH + b.halfH + COLLISION_PAD - Math.abs(dy);

          if (overlapX <= 0 || overlapY <= 0) continue;

          const aDragged = draggingIndex === i;
          const bDragged = draggingIndex === j;
          if (aDragged && bDragged) continue;

          // Spawn sparks on first collision detection (when overlap is small)
          if (overlapX < 0.15 && overlapY < 0.15 && sparksRef.current) {
            const collisionX = (a.pos.x + b.pos.x) / 2;
            const collisionY = (a.pos.y + b.pos.y) / 2;
            sparksRef.current.spawn(collisionX, collisionY);
          }

          if (overlapX < overlapY) {
            const direction = dx >= 0 ? 1 : -1;
            if (aDragged) {
              b.pos.x += direction * overlapX;
            } else if (bDragged) {
              a.pos.x -= direction * overlapX;
            } else {
              a.pos.x -= direction * overlapX * 0.5;
              b.pos.x += direction * overlapX * 0.5;
            }
          } else {
            const direction = dy >= 0 ? 1 : -1;
            if (aDragged) {
              b.pos.y += direction * overlapY;
            } else if (bDragged) {
              a.pos.y -= direction * overlapY;
            } else {
              a.pos.y -= direction * overlapY * 0.5;
              b.pos.y += direction * overlapY * 0.5;
            }
          }
        }
      }
    }

    for (let index = 0; index < bodies.length; index++) {
      const body = bodies[index];
      body.pos.x = THREE.MathUtils.clamp(
        body.pos.x,
        -halfViewW + body.halfW + 0.1,
        halfViewW - body.halfW - 0.1
      );
      body.pos.y = THREE.MathUtils.clamp(
        body.pos.y,
        -halfViewH + body.halfH + 0.1,
        halfViewH - body.halfH - 0.1
      );

      const group = groupRefs.current[index];
      if (!group) continue;

      group.position.x = body.pos.x;
      group.position.y = body.pos.y;

      const active = index === draggingIndex || index === hoveredRef.current;
      const targetScale = active ? 1.06 : 1;
      group.scale.setScalar(
        THREE.MathUtils.lerp(group.scale.x, targetScale, 0.18)
      );

      // Glow effect intensity
      const targetGlow = active ? 1 : 0;
      glowIntensity.current[index] = THREE.MathUtils.lerp(
        glowIntensity.current[index],
        targetGlow,
        0.15
      );

      const glowMesh = glowRefs.current[index];
      if (glowMesh) {
        const mat = glowMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = glowIntensity.current[index] * 0.4;
        glowMesh.scale.setScalar(1 + glowIntensity.current[index] * 0.15);
      }
    }
  });

  return (
    <group>
      <CollisionSparks ref={sparksRef} />

      {technologies.map((tech, index) => (
        <group
          key={`${tech.name}-${index}`}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
          position={[layout.homes[index].x, layout.homes[index].y, 0]}
          onPointerDown={(event) => startDrag(event, index)}
          onPointerOver={(event) => {
            event.stopPropagation();
            if (dragRef.current && dragRef.current.index !== index) return;
            hoveredRef.current = index;
            emitCursor("hover");
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            if (dragRef.current?.index === index) return;
            if (hoveredRef.current === index) hoveredRef.current = -1;
            emitCursor("default");
          }}
        >
          {/* Ambient Glow (behind badge) */}
          <mesh
            ref={(node) => {
              glowRefs.current[index] = node;
            }}
            position={[0, 0, -0.08]}
          >
            <planeGeometry args={[BADGE_W + 0.6, BADGE_H + 0.6]} />
            <meshBasicMaterial
              color="#d4ff00"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <RoundedBox
            args={[BADGE_W, BADGE_H, BADGE_DEPTH]}
            radius={0.12}
            smoothness={4}
          >
            <meshPhysicalMaterial
              color="#101014"
              metalness={0.25}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.18}
              transparent
              opacity={0.85}
            />
          </RoundedBox>

          <RoundedBox
            args={[0.7, 0.7, 0.04]}
            radius={0.12}
            smoothness={4}
            position={[0, 0.14, 0.055]}
          >
            <meshStandardMaterial
              color="#ececf0"
              roughness={0.7}
              metalness={0.05}
            />
          </RoundedBox>

          <mesh position={[0, 0.14, 0.08]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
              map={iconTextures[index]}
              transparent
              toneMapped={false}
            />
          </mesh>

          <mesh position={[0, -0.36, 0.07]}>
            <planeGeometry args={[1.5, 0.28]} />
            <meshBasicMaterial
              map={getLabelTexture(tech.name)}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default TechBadges;
