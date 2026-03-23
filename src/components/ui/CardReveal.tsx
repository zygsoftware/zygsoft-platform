"use client";

import { motion, useReducedMotion } from "framer-motion";

const cardReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

type CardRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function CardReveal({ children, className = "", delay = 0 }: CardRevealProps) {
  const reducedMotion = !!useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      variants={reducedMotion ? undefined : cardReveal}
      transition={{
        duration: 0.55,
        delay: reducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reducedMotion ? undefined : { y: -4, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.div>
  );
}
