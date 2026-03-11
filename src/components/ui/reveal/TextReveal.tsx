"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const textVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const textVariantsReduced = {
  hidden: { opacity: 1, y: 0, filter: "blur(0px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const VIEWPORT = { once: true, amount: 0.08, margin: "0px 0px -80px 0px" } as const;
const FALLBACK_MS = 2500;

export interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Text reveal: smoother, more delayed, elegant block-level reveal.
 * Use for headings first, then paragraphs (stagger via delay).
 * Safe: fallback timeout ensures content is never stuck invisible.
 */
export function TextReveal({
  children,
  delay = 0.12,
  className = "",
}: TextRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT);
  const reducedMotion = !!useReducedMotion();
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), FALLBACK_MS);
    return () => clearTimeout(t);
  }, []);

  const variants = reducedMotion ? textVariantsReduced : textVariants;
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
