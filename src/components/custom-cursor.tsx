"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 32 });
  const springY = useSpring(y, { stiffness: 500, damping: 32 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      x.set(event.clientX - 8);
      y.set(event.clientY - 8);
      setVisible(true);
      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("a, button, input, textarea, select, [data-cursor='active']")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden size-4 rounded-full border border-forest/60 bg-ember/50 mix-blend-multiply md:block dark:mix-blend-screen"
      animate={{ scale: active ? 2.2 : 1, opacity: visible ? 1 : 0 }}
      style={{ x: springX, y: springY }}
      transition={{ duration: 0.18 }}
    />
  );
}
