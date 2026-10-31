import { useRef, useMemo, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

// ── Physics Constants ──
const SEGMENTS = 28;
const SEG_LENGTH = 0.095;
const GRAVITY = -0.0045;
const DAMPING = 0.97;
const CONSTRAINT_ITERS = 10;
const MOUSE_INFLUENCE_X = 0.0025;
const MOUSE_INFLUENCE_Y = 0.001;

// Anchor position defaults (top-right, just above visible viewport)
const DEFAULT_ANCHOR: [number, number] = [2.45, 2.65];

// Renders the HTML badge larger than its CSS size (drei scales by distance)
const BADGE_DISTANCE_FACTOR = 6.5;

// Pre-allocated temp vectors (avoid GC in render loop)
const _vel = new THREE.Vector3();
const _diff = new THREE.Vector3();

interface RopeNode {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  pinned: boolean;
}

// ── Badge Card HTML ──
export type LanyardIdentity = {
  name: string;
  tagline: string;
  avatarUrl: string;
};

const FALLBACK_IDENTITY: LanyardIdentity = {
  name: "Ray Purba",
  tagline: "Creative Developer & WebGL Architect",
  avatarUrl: "",
};

const getInitials = (name: string) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "RP";
};

const BadgeCard = ({ identity }: { identity: LanyardIdentity }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const name = identity.name.trim() || FALLBACK_IDENTITY.name;
  const tagline = identity.tagline.trim() || FALLBACK_IDENTITY.tagline;
  const showPhoto = Boolean(identity.avatarUrl) && !imageFailed;

  return (
  <div
    style={{
      width: 200,
      background: "rgba(14, 14, 18, 0.94)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 16,
      overflow: "hidden",
      userSelect: "none",
      pointerEvents: "none",
      boxShadow:
        "0 25px 50px rgba(0,0,0,0.6), 0 0 20px rgba(212,255,0,0.06)",
    }}
  >
    {/* Acid gradient accent bar */}
    <div
      style={{
        height: 5,
        background: "linear-gradient(90deg, #d4ff00, #00f5a0)",
      }}
    />

    <div style={{ padding: "18px 18px 15px", textAlign: "center" }}>
      {/* Avatar photo (uploaded via admin Profile) */}
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #d4ff00 0%, #00f5a0 100%)",
          margin: "4px auto 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: "2px solid rgba(212, 255, 0, 0.35)",
        }}
      >
        {showPhoto ? (
          <img
            src={identity.avatarUrl}
            alt={name}
            onError={() => setImageFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#09090b",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {getInitials(name)}
          </span>
        )}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#f4f4f5",
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {name}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 9,
          color: "#a1a1aa",
          marginTop: 5,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          lineHeight: 1.6,
        }}
      >
        {tagline}
      </div>

      {/* Separator */}
      <div
        style={{
          width: "100%",
          height: 1,
          background: "rgba(255,255,255,0.07)",
          margin: "12px 0 10px",
        }}
      />

      {/* Badge ID */}
      <div
        style={{
          fontSize: 8,
          color: "#52525b",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        ID: RP-2026-0001
      </div>

      {/* Decorative barcode */}
      <div
        style={{
          display: "flex",
          gap: 1.5,
          justifyContent: "center",
          alignItems: "flex-end",
          height: 18,
        }}
      >
        {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1].map(
          (w, i) => (
            <div
              key={i}
              style={{
                width: w + 1,
                height: [10, 8, 14, 9, 15, 11, 8, 10, 14, 9, 13, 8, 11, 15, 10, 9, 13, 8, 14, 11][i],
                background:
                  i % 7 === 0 ? "#d4ff00" : "rgba(255,255,255,0.12)",
                borderRadius: 0.5,
              }}
            />
          )
        )}
      </div>

      {/* Company label */}
      <div
        style={{
          fontSize: 8,
          color: "#3f3f46",
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase" as const,
          letterSpacing: "0.15em",
          marginTop: 9,
        }}
      >
        SPATIAL STUDIO LAB
      </div>
    </div>
  </div>
  );
};

// ── Main Lanyard Component ──
interface LanyardProps {
  anchor?: [number, number];
  identity?: LanyardIdentity;
}

export const Lanyard = ({
  anchor = DEFAULT_ANCHOR,
  identity = FALLBACK_IDENTITY,
}: LanyardProps) => {
  const [anchorX, anchorY] = anchor;
  const { camera } = useThree();

  // Initialize rope nodes in a natural hanging line
  const nodes = useMemo<RopeNode[]>(
    () =>
      Array.from({ length: SEGMENTS + 1 }, (_, i) => {
        const x = anchorX + Math.sin(i * 0.25) * 0.03;
        const y = anchorY - i * SEG_LENGTH;
        return {
          pos: new THREE.Vector3(x, y, 0),
          prev: new THREE.Vector3(x, y, 0),
          pinned: i === 0,
        };
      }),
    [anchorX, anchorY]
  );

  // Line ref for imperative geometry update
  const lineRef = useRef<any>(null);

  // Reused buffer for line positions (avoids per-frame allocation)
  const linePositions = useMemo(
    () => new Float32Array((SEGMENTS + 1) * 3),
    []
  );

  // Badge group ref (position updated per frame)
  const badgeGroupRef = useRef<THREE.Group>(null!);

  // Clip mesh ref
  const clipRef = useRef<THREE.Mesh>(null!);

  // Drag state
  const drag = useRef<{
    active: boolean;
    nodeIndex: number;
    offset: THREE.Vector3;
  }>({ active: false, nodeIndex: -1, offset: new THREE.Vector3() });

  // Invisible hit mesh ref for pointer events
  const hitRef = useRef<THREE.Mesh>(null!);

  // Initial line points (used on first render, then updated imperatively)
  const initialPoints = useMemo(
    () =>
      nodes.map(
        (n) => [n.pos.x, n.pos.y, n.pos.z] as [number, number, number]
      ),
    [nodes]
  );

  // Convert NDC pointer to world XY (at z=0)
  const ndcToWorld = useCallback(
    (ndcX: number, ndcY: number): THREE.Vector3 => {
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      // Project onto z=0 plane
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    },
    [camera]
  );

  // Pointer down — start drag on badge or last few rope nodes
  const onPointerDown = useCallback(
    (e: { stopPropagation: () => void; pointer: { x: number; y: number } }) => {
      e.stopPropagation();
      const worldPos = ndcToWorld(e.pointer.x, e.pointer.y);
      // Find the closest node in the lower half of the rope to grab
      let closest = nodes.length - 1;
      let closestDist = Infinity;
      for (let i = Math.floor(nodes.length / 2); i < nodes.length; i++) {
        const d = nodes[i].pos.distanceTo(worldPos);
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }
      drag.current = {
        active: true,
        nodeIndex: closest,
        offset: nodes[closest].pos.clone().sub(worldPos),
      };
    },
    [nodes, ndcToWorld]
  );

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  useFrame((state) => {
    const mx = state.pointer.x;
    const my = state.pointer.y;

    // ── Drag: move grabbed node to cursor ──
    if (drag.current.active && drag.current.nodeIndex >= 0) {
      const worldPos = ndcToWorld(mx, my);
      const target = nodes[drag.current.nodeIndex];
      if (target && !target.pinned) {
        target.prev.copy(target.pos);
        target.pos.copy(worldPos.add(drag.current.offset));
      }
    }

    // ── Verlet Integration ──
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.pinned) continue;
      // Skip the actively dragged node (we already set its position)
      if (drag.current.active && i === drag.current.nodeIndex) continue;

      _vel.copy(n.pos).sub(n.prev);
      _vel.multiplyScalar(DAMPING);

      n.prev.copy(n.pos);
      n.pos.add(_vel);
      n.pos.y += GRAVITY;
      n.pos.x += mx * MOUSE_INFLUENCE_X;
      n.pos.y += my * MOUSE_INFLUENCE_Y;
    }

    // ── Distance Constraints ──
    for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];

        _diff.copy(b.pos).sub(a.pos);
        const dist = _diff.length();
        if (dist < 0.0001) continue;

        const factor = ((dist - SEG_LENGTH) / dist) * 0.5;
        _diff.multiplyScalar(factor);

        if (!a.pinned) a.pos.add(_diff);
        if (!b.pinned) b.pos.sub(_diff);
      }
    }

    // ── Update Line Geometry ──
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      linePositions[i * 3] = node.pos.x;
      linePositions[i * 3 + 1] = node.pos.y;
      linePositions[i * 3 + 2] = node.pos.z;
    }
    lineRef.current?.geometry?.setPositions?.(linePositions);

    // ── Update Badge Position ──
    const lastNode = nodes[nodes.length - 1];
    const prevNode = nodes[nodes.length - 2];

    if (badgeGroupRef.current && lastNode) {
      badgeGroupRef.current.position.set(
        lastNode.pos.x,
        lastNode.pos.y - 0.15,
        lastNode.pos.z
      );
      // Compute swing angle from last rope segment
      const swingAngle = Math.atan2(
        lastNode.pos.x - prevNode.pos.x,
        -(lastNode.pos.y - prevNode.pos.y)
      );
      badgeGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        badgeGroupRef.current.rotation.z,
        swingAngle * 0.5,
        0.1
      );
    }

    // ── Update Clip Position ──
    if (clipRef.current && lastNode) {
      clipRef.current.position.set(
        lastNode.pos.x,
        lastNode.pos.y + 0.02,
        lastNode.pos.z + 0.01
      );
    }

    // ── Update hit mesh to follow badge ──
    if (hitRef.current && lastNode) {
      hitRef.current.position.set(
        lastNode.pos.x,
        lastNode.pos.y - 0.15,
        lastNode.pos.z
      );
    }
  });

  // Badge height in world units
  const hitWidth = 2.4;
  const hitHeight = 3;

  return (
    <group>
      {/* Flexible Rope Strap */}
      <Line
        ref={lineRef}
        points={initialPoints}
        color="#c8c8c8"
        lineWidth={5}
        transparent
        opacity={0.9}
      />

      {/* Small metal clip connecting rope to badge */}
      <mesh ref={clipRef} scale={[0.06, 0.1, 0.012]}>
        <boxGeometry />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>

      {/* Invisible drag hit-box — catches pointer events on badge area */}
      <mesh
        ref={hitRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "grab";
        }}
        onPointerMove={() => {
          if (drag.current.active) {
            document.body.style.cursor = "grabbing";
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[hitWidth, hitHeight]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Badge Card (follows physics) */}
      <group ref={badgeGroupRef}>
        <Html
          center
          distanceFactor={BADGE_DISTANCE_FACTOR}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <BadgeCard identity={identity} />
        </Html>
      </group>
    </group>
  );
};

export default Lanyard;
