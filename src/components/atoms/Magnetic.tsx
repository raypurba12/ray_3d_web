import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { useFinePointer } from "../../hooks/useMediaQuery";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  max?: number;
  className?: string;
}

export const Magnetic = ({
  children,
  strength = 0.28,
  max = 16,
  className,
}: MagneticProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.25 });

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const handleMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX =
      (event.clientX - (rect.left + rect.width / 2)) * strength;
    const offsetY =
      (event.clientY - (rect.top + rect.height / 2)) * strength;

    x.set(Math.max(-max, Math.min(max, offsetX)));
    y.set(Math.max(-max, Math.min(max, offsetY)));
  };

  if (!enabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlurCapture={reset}
    >
      {children}
    </motion.span>
  );
};

export default Magnetic;
