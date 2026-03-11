"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const blockVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const blockVariantsReduced = {
  hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const VIEWPORT = { once: true, amount: 0.08, margin: "0px 0px -80px 0px" } as const;
const FALLBACK_MS = 2500;

export interface BlockRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Block/card/section reveal: opacity, slight upward movement, subtle blur.
 * Safe: fallback timeout ensures content is never stuck invisible.
 */
export function BlockReveal({
  children,
  delay = 0,
  className = "",
}: BlockRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT);
  const reducedMotion = !!useReducedMotion();
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), FALLBACK_MS);
    return () => clearTimeout(t);
  }, []);

  const variants = reducedMotion ? blockVariantsReduced : blockVariants;
  const shouldShow = forceVisible || inView;

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={shouldShow ? "visible" : "hidden"}
      transition={delay > 0 ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
