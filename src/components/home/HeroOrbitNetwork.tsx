"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

/*
  HeroOrbitNetwork v7
  • HTML glassmorphism hover cards (not canvas text)
  • Enhanced photon trail: shadow glow + multiple trail dots
  • 5 orbit rings with 1 planet each
  • Smooth lerp transitions on hover
*/

const Y  = (a: number) => `rgba(230,200,0,${a})`;
const G  = (a: number) => `rgba(190,145,0,${a})`;
const Wh = (a: number) => `rgba(255,255,255,${a})`;
const D  = (a: number) => `rgba(52,49,49,${a})`;

const RINGS = [
  { rxF:0.13, ryF:0.088, tilt: 0.22, spd:0.0080, dir: 1, dash:[4,8],   lw:1.2, da:0.55 },
  { rxF:0.24, ryF:0.160, tilt:-0.18, spd:0.0045, dir:-1, dash:[3,9],   lw:1.0, da:0.42 },
  { rxF:0.37, ryF:0.246, tilt: 0.30, spd:0.0030, dir: 1, dash:[5,11],  lw:0.9, da:0.30 },
  { rxF:0.51, ryF:0.338, tilt:-0.12, spd:0.0018, dir:-1, dash:[3,13],  lw:0.8, da:0.20 },
  { rxF:0.66, ryF:0.436, tilt: 0.20, spd:0.0010, dir: 1, dash:[6,16],  lw:0.7, da:0.12 },
];

interface PlanetDef {
  phase: number;
  labelKey: string;
  descKey: string;
  yellow: boolean;
  icon: string;
}

const PLANETS: PlanetDef[] = [
  { phase:1.2, labelKey:"apiLabel",   descKey:"apiDesc",   yellow:true,  icon:"⚡" },
  { phase:2.8, labelKey:"webLabel",   descKey:"webDesc",   yellow:false, icon:"🌐" },
  { phase:0.6, labelKey:"seoLabel",   descKey:"seoDesc",   yellow:true,  icon:"🔍" },
  { phase:3.8, labelKey:"cloudLabel", descKey:"cloudDesc", yellow:false, icon:"☁️" },
  { phase:1.9, labelKey:"wwwLabel",   descKey:"wwwDesc",   yellow:false, icon:"🚀" },
];

const STARS = Array.from({ length: 38 }, (_, i) => ({
  x: ((i * 137.5) % 100) / 100,
  y: ((i * 89.3)  % 100) / 100,
  r: 0.45 + (i % 3) * 0.28,
  a: 0.055 + (i % 4) * 0.025,
  tp: i * 0.85,
  ts: 0.28 + (i % 4) * 0.10,
}));

function ellipsePoint(cx:number, cy:number, rx:number, ry:number, rot:number, a:number) {
  const lx = rx * Math.cos(a), ly = ry * Math.sin(a);
  return {
    x: cx + lx * Math.cos(rot) - ly * Math.sin(rot),
    y: cy + lx * Math.sin(rot) + ly * Math.cos(rot),
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

interface HoverCard { ri: number; x: number; y: number; }

export function HeroOrbitNetwork() {
  const tLoc = useTranslations("HeroOrbit");
  const [boxWidth, setBoxWidth] = useState(0);
  const translatedPlanets = useMemo(() => PLANETS.map(p => ({
    ...p,
    label: tLoc(p.labelKey),
    desc: tLoc(p.descKey)
  })), [tLoc]);

  const cRef = useRef<HTMLCanvasElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  const mousePos    = useRef({ x: -9999, y: -9999 });
  const hoveredIdx  = useRef(-1);
  const prevHov     = useRef(-1);
  const ringAlphas  = useRef([1,1,1,1,1]);
  const planetScales= useRef([1,1,1,1,1]);
  const planetPos   = useRef<Array<{x:number;y:number}>>(
    Array.from({length:5}, () => ({x:0,y:0}))
  );

  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null);
  const hoverCardRef = useRef<HoverCard | null>(null);

  useEffect(() => {
    const canvas = cRef.current, box = bRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const r = box.getBoundingClientRect();
      W = Math.round(r.width) || box.clientWidth;
      H = Math.round(r.height) || box.clientHeight;
      setBoxWidth(W);
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box); resize();

    const onMove = (e: MouseEvent) => {
      const r = box.getBoundingClientRect();
      mousePos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mousePos.current = { x:-9999, y:-9999 }; };
    box.addEventListener("mousemove", onMove);
    box.addEventListener("mouseleave", onLeave);

    const start = performance.now();
    let raf = 0;

    const draw = () => {
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5, cy = H * 0.5;

      // ── Hover detection ──
      const mx = mousePos.current.x, my = mousePos.current.y;
      let newHov = -1;
      for (let i = 0; i < 5; i++) {
        const pos = planetPos.current[i];
        if (Math.hypot(mx - pos.x, my - pos.y) < 30) { newHov = i; break; }
      }
      hoveredIdx.current = newHov;

      // Update React state only on change
      if (newHov !== prevHov.current) {
        prevHov.current = newHov;
        if (newHov === -1) {
          hoverCardRef.current = null;
          setHoverCard(null);
        } else {
          const p = planetPos.current[newHov];
          const card = { ri: newHov, x: p.x, y: p.y };
          hoverCardRef.current = card;
          setHoverCard(card);
        }
      } else if (newHov !== -1) {
        // Update position live
        const p = planetPos.current[newHov];
        hoverCardRef.current = { ri: newHov, x: p.x, y: p.y };
        setHoverCard({ ri: newHov, x: p.x, y: p.y });
      }

      // Smooth fade / scale
      for (let i = 0; i < 5; i++) {
        const iH = hoveredIdx.current === i;
        const anyH = hoveredIdx.current !== -1;
        ringAlphas.current[i]   = lerp(ringAlphas.current[i],   anyH ? (iH ? 1.0 : 0.18) : 1.0, 0.08);
        planetScales.current[i] = lerp(planetScales.current[i], iH ? 1.6 : 1.0, 0.10);
      }

      // ── Stars ──
      const starDim = hoveredIdx.current !== -1 ? 0.25 : 1;
      for (const s of STARS) {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * s.ts + s.tp)) * starDim;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = D(a);
        ctx.fill();
      }

      // ── Rings + photon + planets ──
      for (let ri = 0; ri < RINGS.length; ri++) {
        const ring   = RINGS[ri];
        const planet = translatedPlanets[ri];
        const alpha  = ringAlphas.current[ri];
        const rx = W * ring.rxF, ry = H * ring.ryF;
        const rot = t * ring.spd * Math.PI * 2 * ring.dir + ring.tilt;
        const isHov = hoveredIdx.current === ri;

        // ── Ring stroke ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Halo glow
        ctx.strokeStyle = Y(ring.da * 0.18 * alpha);
        ctx.lineWidth = 6; ctx.setLineDash([]);
        ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.stroke();

        // Main stroke — highlighted if hovered
        ctx.strokeStyle = isHov ? Y(ring.da * 2.2) : `rgba(0, 0, 0, ${ring.da * alpha * 1.2})`;
        ctx.lineWidth   = isHov ? ring.lw * 2.2 : ring.lw;
        ctx.setLineDash(isHov ? [] : ring.dash);
        ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // ── Planet / Photon Interaction ───────────────────────────
        const sc     = planetScales.current[ri];
        const pSz    = (3.8 - ri * 0.22) * sc;
        const pulse  = 0.88 + 0.12 * Math.sin(t * 1.8 + ri * 1.1);

        const p1 = planet.phase;
        const ARC_LEN = 0.55;
        const p0 = p1 - ARC_LEN * ring.dir; // tail start

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Yellow outer tail glow
        ctx.shadowColor = `rgba(230,200,0,0.6)`;
        ctx.shadowBlur  = isHov ? 20 : 12;
        ctx.strokeStyle = `rgba(255,230,80,${(isHov ? 0.55 : 0.32) * alpha})`;
        ctx.lineWidth   = ring.lw * 8;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, p0, p1, ring.dir === -1);
        ctx.stroke();

        // Yellow inner tail core
        ctx.shadowColor = "rgba(230,200,0,1)";
        ctx.shadowBlur  = isHov ? 14 : 8;
        ctx.strokeStyle = `rgba(230,200,0,${(isHov ? 0.85 : 0.60) * alpha})`;
        ctx.lineWidth   = ring.lw * 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, p0, p1, ring.dir === -1);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();

        // ── Dark Glowing Head (The Planet Node) ──
        const { x: px, y: py } = ellipsePoint(cx, cy, rx, ry, rot, planet.phase);
        planetPos.current[ri] = { x: px, y: py };

        // Outer aura
        const hg = ctx.createRadialGradient(px, py, 0, px, py, pSz * 6.2);
        hg.addColorStop(0,    `rgba(52,49,49,${(isHov ? 0.48 : 0.34) * alpha})`);
        hg.addColorStop(0.45, `rgba(52,49,49,${(isHov ? 0.18 : 0.10) * alpha})`);
        hg.addColorStop(1,    "rgba(52,49,49,0)");
        
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, pSz * 6.2, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();

        // Soft yellow carrier glow
        const yg = ctx.createRadialGradient(px, py, 0, px, py, pSz * 3.6);
        yg.addColorStop(0, `rgba(230,200,0,${(isHov ? 0.28 : 0.18) * alpha})`);
        yg.addColorStop(0.55, `rgba(230,200,0,${(isHov ? 0.10 : 0.06) * alpha})`);
        yg.addColorStop(1, "rgba(230,200,0,0)");
        ctx.beginPath();
        ctx.arc(px, py, pSz * 3.6, 0, Math.PI * 2);
        ctx.fillStyle = yg;
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(px, py, (pSz + 2.3) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52,49,49,${(isHov ? 0.34 : 0.22) * alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Middle ring
        ctx.beginPath();
        ctx.arc(px, py, (pSz + 0.9) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230,200,0,${(isHov ? 0.70 : 0.52) * alpha})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Solid core with dark glow
        ctx.save();
        ctx.shadowColor = "rgba(52,49,49,0.9)";
        ctx.shadowBlur  = isHov ? 20 : 12;
        ctx.beginPath();
        ctx.arc(px, py, (pSz + 0.1) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,49,49,1)`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Tiny center highlight
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.3, pSz * 0.34) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,195,${(isHov ? 0.95 : 0.78) * alpha})`;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label (always visible)
        ctx.globalAlpha = Math.max(0.25, alpha);
        ctx.font = `${isHov ? "700" : "600"} ${isHov ? 10 : 8.5}px Inter, system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        const tw  = ctx.measureText(planet.label).width;
        const lox = px > cx ? pSz + 6 : -(pSz + 6 + tw);
        ctx.fillStyle = planet.yellow ? G(0.75) : D(0.38);
        ctx.fillText(planet.label, px + lox, py);
        ctx.globalAlpha = 1;
      }

      // ── Center Sun ──
      const sunDim = hoveredIdx.current !== -1 ? 0.70 : 1.0;
      const p = 0.82 + Math.sin(t * 1.05) * 0.18;
      const ringSpin = t * 0.72;

      const fc = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * p);
      fc.addColorStop(0, Y(0.10 * sunDim)); fc.addColorStop(0.6, Y(0.035 * sunDim));
      fc.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.fillStyle = fc; ctx.arc(cx, cy, 80*p, 0, Math.PI*2); ctx.fill();

      const ic = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34 * p);
      ic.addColorStop(0, Wh(0.95 * sunDim)); ic.addColorStop(0.3, Y(0.58 * sunDim));
      ic.addColorStop(0.8, Y(0.08 * sunDim)); ic.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.fillStyle = ic; ctx.arc(cx, cy, 34*p, 0, Math.PI*2); ctx.fill();

      ctx.globalAlpha = sunDim;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ringSpin);

      ctx.beginPath();
      ctx.arc(0, 0, 22 * p, 0, Math.PI * 2);
      ctx.strokeStyle = Y(0.20);
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 18 * p, 0, Math.PI * 2);
      ctx.strokeStyle = Y(0.82);
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 13.5 * p, 0, Math.PI * 2);
      ctx.strokeStyle = D(0.22);
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 9.5 * p, Math.PI * 0.22, Math.PI * 1.92);
      ctx.strokeStyle = Y(0.95);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.setLineDash([]);

      for (const a of [0, Math.PI / 2]) {
        ctx.beginPath();
        ctx.moveTo(-15 * p * Math.cos(a), -15 * p * Math.sin(a));
        ctx.lineTo(15 * p * Math.cos(a), 15 * p * Math.sin(a));
        ctx.strokeStyle = Wh(0.18);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(230,200,0,0.55)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, 8.4 * p, 0, Math.PI * 2);
      ctx.fillStyle = D(0.98);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, 5.8 * p, 0, Math.PI * 2);
      ctx.fillStyle = Y(0.96);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 2.5 * p, 0, Math.PI * 2);
      ctx.fillStyle = Wh(0.94);
      ctx.fill();
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
  }, [translatedPlanets]);

  return (
    <div ref={bRef} className="absolute inset-0" aria-hidden style={{ cursor:"default" }}>
      <canvas ref={cRef} className="block h-full w-full" />

      {/* HTML hover card */}
      <AnimatePresence>
        {hoverCard !== null && (() => {
          const planet = translatedPlanets[hoverCard.ri];
          const isRight = hoverCard.x > boxWidth * 0.6;
          const cardW = 220;
          const rawLeft = isRight
            ? hoverCard.x - cardW - 16
            : hoverCard.x + 24;
          const safeLeft = Math.max(8, Math.min(rawLeft, Math.max(boxWidth, 500) - cardW - 8));
          const rawTop  = hoverCard.y - 70;
          const safeTop = Math.max(8, rawTop);

          return (
            <motion.div
              key={hoverCard.ri}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{    opacity: 0, scale: 0.90,  y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute"
              style={{ left: safeLeft, top: safeTop, width: cardW }}
            >
              <div
                className="rounded-[1.25rem] border border-white/80 shadow-[0_24px_54px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.7)_inset] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                {/* Visual gradient accent on top */}
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ background: planet.yellow ? 'linear-gradient(90deg, #e6c800, transparent)' : 'linear-gradient(90deg, #343131, transparent)' }}
                />
                
                {/* Card header bar */}
                <div className="flex items-center gap-3 px-4 pt-5 pb-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm border ${planet.yellow ? 'bg-[#e6c800]/10 border-[#e6c800]/20' : 'bg-[#343131]/5 border-[#343131]/10'}`}>
                    <span className="text-[14px] leading-none">{planet.icon}</span>
                  </div>
                  <span
                    className="text-[12.5px] font-black uppercase tracking-[0.2em]"
                    style={{ color: planet.yellow ? "#a08000" : "#343131" }}
                  >
                    {planet.label}
                  </span>
                </div>

                {/* Description */}
                <div className="px-5 pb-5">
                  <p className="text-[11px] font-medium leading-[1.65] text-[#343131]/60">
                    {planet.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
