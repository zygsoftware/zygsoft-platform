"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Cpu,
  Monitor,
  PenTool,
  Scale,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const Y = (a: number) => `rgba(230,200,0,${a})`;
const G = (a: number) => `rgba(190,145,0,${a})`;
const Wh = (a: number) => `rgba(255,255,255,${a})`;
const D = (a: number) => `rgba(52,49,49,${a})`;

const RINGS = [
  { rxF: 0.17, ryF: 0.066, tilt: 0.16, spd: 0.008, dir: 1, dash: [4, 8], lw: 1.2, da: 0.56 },
  { rxF: 0.3, ryF: 0.108, tilt: -0.12, spd: 0.0048, dir: -1, dash: [3, 9], lw: 1.0, da: 0.44 },
  { rxF: 0.44, ryF: 0.156, tilt: 0.18, spd: 0.0033, dir: 1, dash: [5, 11], lw: 0.9, da: 0.32 },
  { rxF: 0.58, ryF: 0.214, tilt: -0.1, spd: 0.002, dir: -1, dash: [3, 13], lw: 0.8, da: 0.22 },
  { rxF: 0.72, ryF: 0.276, tilt: 0.12, spd: 0.0012, dir: 1, dash: [6, 16], lw: 0.7, da: 0.14 },
];

interface PlanetDef {
  phase: number;
  labelKey: string;
  descKey: string;
  metaKey: string;
  yellow: boolean;
  Icon: LucideIcon;
}

const PLANETS: PlanetDef[] = [
  { phase: 1.24, labelKey: "legalLabel", descKey: "legalDesc", metaKey: "legalMeta", yellow: true, Icon: Scale },
  { phase: 2.84, labelKey: "webLabel", descKey: "webDesc", metaKey: "webMeta", yellow: false, Icon: Monitor },
  { phase: 0.58, labelKey: "automationLabel", descKey: "automationDesc", metaKey: "automationMeta", yellow: true, Icon: Cpu },
  { phase: 3.76, labelKey: "brandLabel", descKey: "brandDesc", metaKey: "brandMeta", yellow: false, Icon: PenTool },
  { phase: 1.94, labelKey: "growthLabel", descKey: "growthDesc", metaKey: "growthMeta", yellow: false, Icon: TrendingUp },
];

const STARS = Array.from({ length: 38 }, (_, i) => ({
  x: ((i * 137.5) % 100) / 100,
  y: ((i * 89.3) % 100) / 100,
  r: 0.45 + (i % 3) * 0.28,
  a: 0.055 + (i % 4) * 0.025,
  tp: i * 0.85,
  ts: 0.28 + (i % 4) * 0.1,
}));

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, rot: number, a: number) {
  const lx = rx * Math.cos(a);
  const ly = ry * Math.sin(a);
  return {
    x: cx + lx * Math.cos(rot) - ly * Math.sin(rot),
    y: cy + lx * Math.sin(rot) + ly * Math.cos(rot),
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface HoverCard {
  ri: number;
  x: number;
  y: number;
}

type HeroOrbitNetworkProps = {
  focusGroup?: "products" | "portfolio" | null;
};

export function HeroOrbitNetwork({ focusGroup = null }: HeroOrbitNetworkProps) {
  const tLoc = useTranslations("HeroOrbit");
  const [boxWidth, setBoxWidth] = useState(0);
  const translatedPlanets = useMemo(
    () =>
      PLANETS.map((planet) => ({
        ...planet,
        label: tLoc(planet.labelKey),
        desc: tLoc(planet.descKey),
        meta: tLoc(planet.metaKey),
      })),
    [tLoc],
  );

  const cRef = useRef<HTMLCanvasElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -9999, y: -9999 });
  const hoveredIdx = useRef(-1);
  const prevHov = useRef(-1);
  const ringAlphas = useRef([1, 1, 1, 1, 1]);
  const planetScales = useRef([1, 1, 1, 1, 1]);
  const planetPos = useRef<Array<{ x: number; y: number }>>(Array.from({ length: 5 }, () => ({ x: 0, y: 0 })));

  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null);

  useEffect(() => {
    const canvas = cRef.current;
    const box = bRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;

    const resize = () => {
      const r = box.getBoundingClientRect();
      W = Math.round(r.width) || box.clientWidth;
      H = Math.round(r.height) || box.clientHeight;
      dpr = Math.min(window.devicePixelRatio, 2);
      setBoxWidth(W);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    const onMove = (e: MouseEvent) => {
      const r = box.getBoundingClientRect();
      mousePos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onLeave = () => {
      mousePos.current = { x: -9999, y: -9999 };
    };

    box.addEventListener("mousemove", onMove);
    box.addEventListener("mouseleave", onLeave);

    const start = performance.now();
    let raf = 0;

    const draw = () => {
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.51;
      const cy = H * 0.5;
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      let nextHover = -1;
      for (let i = 0; i < 5; i += 1) {
        const pos = planetPos.current[i];
        if (Math.hypot(mx - pos.x, my - pos.y) < 32) {
          nextHover = i;
          break;
        }
      }
      hoveredIdx.current = nextHover;

      const focusedIndices =
        focusGroup === "products"
          ? [0, 2]
          : focusGroup === "portfolio"
            ? [1, 3, 4]
            : [];
      const hasFocusGroup = nextHover === -1 && focusedIndices.length > 0;

      if (nextHover !== prevHov.current) {
        prevHov.current = nextHover;
        if (nextHover === -1) {
          setHoverCard(null);
        } else {
          const p = planetPos.current[nextHover];
          setHoverCard({ ri: nextHover, x: p.x, y: p.y });
        }
      } else if (nextHover !== -1) {
        const p = planetPos.current[nextHover];
        setHoverCard({ ri: nextHover, x: p.x, y: p.y });
      }

      const starDim = nextHover !== -1 ? 0.22 : 1;
      for (const s of STARS) {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * s.ts + s.tp)) * starDim;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = D(a);
        ctx.fill();
      }

      for (let ri = 0; ri < RINGS.length; ri += 1) {
        const ring = RINGS[ri];
        const planet = translatedPlanets[ri];
        const isHover = nextHover === ri;
        const isFocused = focusedIndices.includes(ri);
        const targetAlpha =
          nextHover !== -1
            ? (isHover ? 1 : 0.18)
            : hasFocusGroup
              ? (isFocused ? 1 : 0.2)
              : 1;
        const targetScale =
          nextHover !== -1
            ? (isHover ? 1.6 : 1)
            : hasFocusGroup
              ? (isFocused ? 1.24 : 0.96)
              : 1;

        ringAlphas.current[ri] = lerp(ringAlphas.current[ri], targetAlpha, 0.08);
        planetScales.current[ri] = lerp(planetScales.current[ri], targetScale, 0.1);

        const alpha = ringAlphas.current[ri];
        const scale = planetScales.current[ri];
        const rx = W * ring.rxF;
        const ry = H * ring.ryF;
        const rot = ring.tilt;
        const arcEnd = planet.phase + t * ring.spd * Math.PI * 2 * ring.dir;
        const arcStart = arcEnd - 0.5 * ring.dir;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.strokeStyle = Y(ring.da * 0.16 * alpha);
        ctx.lineWidth = 7;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = isHover || isFocused ? Y(ring.da * 2.1) : `rgba(0,0,0,${ring.da * alpha * 1.18})`;
        ctx.lineWidth = isHover || isFocused ? ring.lw * 2.25 : ring.lw;
        ctx.setLineDash(isHover || isFocused ? [] : ring.dash);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.shadowColor = "rgba(230,200,0,0.6)";
        ctx.shadowBlur = isHover || isFocused ? 20 : 12;
        ctx.strokeStyle = `rgba(255,230,80,${(isHover || isFocused ? 0.54 : 0.28) * alpha})`;
        ctx.lineWidth = ring.lw * 7.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, arcStart, arcEnd, ring.dir === -1);
        ctx.stroke();

        ctx.shadowBlur = isHover || isFocused ? 14 : 8;
        ctx.strokeStyle = `rgba(230,200,0,${(isHover || isFocused ? 0.86 : 0.58) * alpha})`;
        ctx.lineWidth = ring.lw * 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, arcStart, arcEnd, ring.dir === -1);
        ctx.stroke();
        ctx.restore();

        const { x: px, y: py } = ellipsePoint(cx, cy, rx, ry, rot, arcEnd);
        planetPos.current[ri] = { x: px, y: py };
        const nodeSize = (4.1 - ri * 0.24) * scale;
        const pulse = 0.88 + 0.12 * Math.sin(t * 1.8 + ri * 1.1);

        const halo = ctx.createRadialGradient(px, py, 0, px, py, nodeSize * 6.6);
        halo.addColorStop(0, `rgba(52,49,49,${(isHover || isFocused ? 0.5 : 0.32) * alpha})`);
        halo.addColorStop(0.45, `rgba(52,49,49,${(isHover || isFocused ? 0.18 : 0.08) * alpha})`);
        halo.addColorStop(1, "rgba(52,49,49,0)");
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 6.6, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        const carrier = ctx.createRadialGradient(px, py, 0, px, py, nodeSize * 3.8);
        carrier.addColorStop(0, `rgba(230,200,0,${(isHover || isFocused ? 0.34 : 0.16) * alpha})`);
        carrier.addColorStop(0.56, `rgba(230,200,0,${(isHover || isFocused ? 0.11 : 0.05) * alpha})`);
        carrier.addColorStop(1, "rgba(230,200,0,0)");
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 3.8, 0, Math.PI * 2);
        ctx.fillStyle = carrier;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, (nodeSize + 2.4) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52,49,49,${(isHover || isFocused ? 0.34 : 0.2) * alpha})`;
        ctx.lineWidth = 1.15;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, (nodeSize + 1) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230,200,0,${(isHover || isFocused ? 0.76 : 0.48) * alpha})`;
        ctx.lineWidth = 1.05;
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = "rgba(52,49,49,0.9)";
        ctx.shadowBlur = isHover || isFocused ? 22 : 12;
        ctx.beginPath();
        ctx.arc(px, py, (nodeSize + 0.1) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(52,49,49,1)";
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.3, nodeSize * 0.34) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,195,${(isHover || isFocused ? 0.96 : 0.76) * alpha})`;
        ctx.fill();

        ctx.globalAlpha = Math.max(0.28, alpha);
        ctx.font = `${isHover || isFocused ? "700" : "600"} ${isHover || isFocused ? 10 : 8.5}px Montserrat, sans-serif`;
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(planet.label).width;
        const offsetX = px > cx ? nodeSize + 8 : -(nodeSize + 8 + tw);
        ctx.fillStyle = planet.yellow ? G(0.76) : D(0.42);
        ctx.fillText(planet.label, px + offsetX, py);
        ctx.globalAlpha = 1;
      }

      const sunBoost = focusGroup ? 1.08 : 1;
      const sunDim = nextHover !== -1 ? 0.8 : 1;
      const p = (0.92 + Math.sin(t * 1.05) * 0.18) * sunBoost;
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 112 * p);
      outerGlow.addColorStop(0, Y(0.16 * sunDim));
      outerGlow.addColorStop(0.5, Y(0.06 * sunDim));
      outerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 112 * p, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42 * p);
      coreGlow.addColorStop(0, Wh(0.98 * sunDim));
      coreGlow.addColorStop(0.24, Y(0.76 * sunDim));
      coreGlow.addColorStop(0.72, Y(0.14 * sunDim));
      coreGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 42 * p, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      ctx.globalAlpha = sunDim;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 10);

      ctx.beginPath();
      ctx.arc(0, 0, 29 * p, 0, Math.PI * 2);
      ctx.strokeStyle = Y(0.18);
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 24 * p, 0, Math.PI * 2);
      ctx.strokeStyle = Y(0.92);
      ctx.lineWidth = 2.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 17.5 * p, 0, Math.PI * 2);
      ctx.strokeStyle = D(0.28);
      ctx.lineWidth = 1.9;
      ctx.stroke();

      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 12 * p, Math.PI * 0.22, Math.PI * 1.92);
      ctx.strokeStyle = Y(0.96);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      for (const angle of [0, Math.PI / 2]) {
        ctx.beginPath();
        ctx.moveTo(-18 * p * Math.cos(angle), -18 * p * Math.sin(angle));
        ctx.lineTo(18 * p * Math.cos(angle), 18 * p * Math.sin(angle));
        ctx.strokeStyle = Wh(0.16);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(230,200,0,0.55)";
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * p, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52,49,49,0.98)";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, 7.6 * p, 0, Math.PI * 2);
      ctx.fillStyle = Y(0.96);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 3.2 * p, 0, Math.PI * 2);
      ctx.fillStyle = Wh(0.94);
      ctx.fill();

      ctx.font = "700 9px Montserrat, sans-serif";
      ctx.fillStyle = D(0.56);
      ctx.textAlign = "center";
      ctx.fillText("ZYGSOFT", cx, cy + 42 * p);
      ctx.font = "700 8px Montserrat, sans-serif";
      ctx.fillStyle = Y(0.72);
      ctx.fillText("CORE", cx, cy + 54 * p);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.removeEventListener("mousemove", onMove);
      box.removeEventListener("mouseleave", onLeave);
    };
  }, [focusGroup, translatedPlanets]);

  return (
    <div ref={bRef} className="absolute inset-0" aria-hidden style={{ cursor: "default" }}>
      <canvas ref={cRef} className="block h-full w-full" />

      <AnimatePresence>
        {hoverCard !== null && (() => {
          const planet = translatedPlanets[hoverCard.ri];
          const Icon = planet.Icon;
          const isRight = hoverCard.x > boxWidth * 0.6;
          const cardW = 248;
          const rawLeft = isRight ? hoverCard.x - cardW - 16 : hoverCard.x + 24;
          const safeLeft = Math.max(8, Math.min(rawLeft, Math.max(boxWidth, 500) - cardW - 8));
          const safeTop = Math.max(8, hoverCard.y - 74);

          return (
            <motion.div
              key={hoverCard.ri}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute"
              style={{ left: safeLeft, top: safeTop, width: cardW }}
            >
              <div className="overflow-hidden rounded-[1.4rem] border border-[#343131]/12 bg-[linear-gradient(150deg,rgba(255,255,255,0.98),rgba(248,247,242,0.96))] shadow-[0_26px_58px_rgba(25,20,10,0.12)]">
                <div
                  className="h-1 w-full"
                  style={{
                    background: planet.yellow
                      ? "linear-gradient(90deg, #e6c800, rgba(230,200,0,0.1))"
                      : "linear-gradient(90deg, rgba(52,49,49,0.8), rgba(52,49,49,0.08))",
                  }}
                />

                <div className="flex items-start gap-3 px-5 pt-5">
                  <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm ${planet.yellow ? "border-[#e6c800]/35 bg-[#e6c800]/12 text-[#9a7b00]" : "border-[#343131]/10 bg-[#343131]/[0.04] text-[#343131]"}`}>
                    <Icon size={18} strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#343131]/42">
                      {planet.meta}
                    </p>
                    <h3 className="mt-2 text-[16px] font-black tracking-[-0.02em] text-[#201d1b]">
                      {planet.label}
                    </h3>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3">
                  <p className="text-[12px] font-medium leading-[1.65] text-[#343131]/62">
                    {planet.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className={`inline-flex rounded-full px-2.5 py-1 ${planet.yellow ? "bg-[#e6c800]/14 text-[#8e7200]" : "bg-[#343131]/[0.06] text-[#343131]/58"}`}>
                      Orbit Node
                    </span>
                    <span className="text-[#343131]/30">•</span>
                    <span className="text-[#343131]/46">ZYGSOFT Core</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
