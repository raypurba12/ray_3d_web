import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  AnimatePresence,
} from "framer-motion";

import { useFinePointer } from "../../hooks/useMediaQuery";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor = () => {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.35 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    let revealed = false;

    const handleMove = (event: PointerEvent) => {
      if (!revealed) {
        revealed = true;
        root.classList.add("has-custom-cursor");
      }
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const handleOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setHovering(
        Boolean(
          target?.closest(
            'a, button, [role="button"], [data-cursor="hover"]'
          )
        )
      );
    };

    const handleLeave = () => setVisible(false);

    const handleDown = (event: PointerEvent) => {
      setPressed(true);
      // Create ripple at click position
      const newRipple: Ripple = {
        id: Date.now(),
        x: event.clientX,
        y: event.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
      // Auto-remove after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const handleUp = () => setPressed(false);

    const handleVariant = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setHovering(detail === "hover");
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("blur", handleLeave);
    window.addEventListener("cursor-variant", handleVariant as EventListener);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("blur", handleLeave);
      window.removeEventListener(
        "cursor-variant",
        handleVariant as EventListener
      );
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      {/* Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-acid/60"
            style={{
              left: ripple.x,
              top: ripple.y,
              x: "-50%",
              y: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Cursor Dot */}
      <motion.div
        className="absolute left-0 top-0"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      >
        <motion.span
          className="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 rounded-full bg-acid shadow-[0_0_10px_rgba(212,255,0,0.7)]"
          animate={{ scale: pressed ? 0.5 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>

      {/* Cursor Ring */}
      <motion.div
        className="absolute left-0 top-0"
        style={{ x: ringX, y: ringY }}
      >
        <motion.span
          className="absolute -ml-4 -mt-4 block h-8 w-8 rounded-full border border-acid/50"
          animate={{
            scale: hovering ? 1.6 : pressed ? 0.8 : 1,
            opacity: visible ? 1 : 0,
            borderColor: hovering
              ? "rgba(212,255,0,0.9)"
              : "rgba(212,255,0,0.45)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </motion.div>
    </div>,
    document.body
  );
};

export default CustomCursor;
