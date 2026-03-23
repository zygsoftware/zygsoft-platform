"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Tam hero atmosfer: beyaz taban üzerinde çok hafif grafit sis / derinlik.
 * Sol zayıf, sağ/orta-sağ güçlü — tipografi korunur.
 */
export function HeroAtmosphere() {
  const reduceMotion = useReducedMotion();

  const driftSlow = reduceMotion
    ? { x: 0, y: 0 }
    : {
        x: [0, 14, 6, -10, 0],
        y: [0, -8, 5, -4, 0],
      };

  const driftMist = reduceMotion
    ? { opacity: 0.68, x: 0 }
    : {
        opacity: [0.62, 0.78, 0.68, 0.74, 0.62],
        x: [0, -18, 4, 0],
      };

  const driftBloom = reduceMotion
    ? { opacity: 0.48, scale: 1 }
    : {
        opacity: [0.4, 0.55, 0.45, 0.5, 0.4],
        scale: [1, 1.02, 1.01, 1],
      };

  const tSlow = reduceMotion
    ? { duration: 0.01 }
    : { duration: 44, repeat: Infinity, ease: "easeInOut" as const };

  const tMist = reduceMotion
    ? { duration: 0.01 }
    : { duration: 52, repeat: Infinity, ease: "easeInOut" as const };

  const tBloom = reduceMotion
    ? { duration: 0.01 }
    : { duration: 38, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Taban: nötr, sol taraf neredeyse saf beyaz */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #fafafa 45%, #f7f7f8 100%)",
        }}
      />

      {/* Katman 1 — geniş atmosferik gri, sağa yoğun */}
      <motion.div
        className="absolute inset-0"
        animate={driftSlow}
        transition={tSlow}
        style={{
          background: `
            radial-gradient(ellipse 95% 90% at 96% 46%, rgba(52, 54, 62, 0.11) 0%, transparent 50%),
            radial-gradient(ellipse 75% 85% at 82% 52%, rgba(72, 74, 84, 0.07) 0%, transparent 46%),
            linear-gradient(
              92deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 34%,
              rgba(241, 241, 244, 0.55) 62%,
              rgba(228, 228, 234, 0.42) 100%
            )
          `,
        }}
      />

      {/* Katman 2 — orta-sağ grafit sis */}
      <motion.div
        className="absolute inset-0"
        animate={driftMist}
        transition={tMist}
        style={{
          background: `
            radial-gradient(ellipse 65% 75% at 88% 48%, rgba(28, 30, 36, 0.085) 0%, transparent 42%),
            radial-gradient(ellipse 50% 60% at 72% 58%, rgba(55, 58, 68, 0.05) 0%, transparent 40%)
          `,
        }}
      />

      {/* Soğuk derinlik — çok hafif teal */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 80% 40%, rgba(13, 148, 136, 0.045) 0%, transparent 45%)",
        }}
      />

      {/* Sarı sıcaklık — sadece nesne bölgesi, çok düşük */}
      <motion.div
        className="absolute inset-0"
        animate={driftBloom}
        transition={tBloom}
        style={{
          background:
            "radial-gradient(ellipse 38% 48% at 92% 54%, rgba(230, 200, 0, 0.055) 0%, transparent 52%)",
          transformOrigin: "92% 54%",
        }}
      />

      {/* Sol tipografi alanı — ekstra temizlik (veil’i maskelemez, sadece hafif) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 28%, transparent 48%)",
        }}
      />
    </div>
  );
}
