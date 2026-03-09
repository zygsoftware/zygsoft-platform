"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown, Cpu } from "lucide-react";
import { ParticleField } from "@/components/ui/ParticleField";
import { Magnetic } from "@/components/ui/Magnetic";
import { createRevealUp, staggerContainer } from "@/components/ui/motion";

/* ──────────────────────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────────────────────── */
const STATS = [
    { value: "250+",  label: "Otomasyon Sistemi"  },
    { value: "99.8%", label: "Müşteri Memnuniyeti" },
    { value: "4.5×",  label: "Ortalama Büyüme"    },
];

const METRICS = [
    { label: "SYS_UPTIME",  value: "99.8%", bar: 99 },
    { label: "API_LATENCY", value: "42ms",  bar: 76 },
    { label: "THROUGHPUT",  value: "98.3%", bar: 98 },
];

const SYS_NODES = [
    { label: "CORE_ENGINE",   status: "ONLINE",  live: true  },
    { label: "DATA_PIPELINE", status: "SYNC",    live: true  },
    { label: "API_GATEWAY",   status: "ONLINE",  live: true  },
    { label: "AUTOMATION",    status: "RUNNING", live: false },
];

const LINE1 = ["Dijital", "Sistemlerin"];
const LINE2 = ["Yeni", "Çağı"];

/* ──────────────────────────────────────────────────────────────
   HERO SECTION — LIGHT VISUAL SYSTEM
────────────────────────────────────────────────────────────── */
export function HeroSection() {
    const sectionRef   = useRef<HTMLElement>(null);
    const reduceMotion = !!useReducedMotion();

    /* ── Mouse parallax — no re-renders ────────────────────── */
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    useEffect(() => {
        if (reduceMotion) return;
        const onMove = (e: MouseEvent) => {
            rawX.set((e.clientX / window.innerWidth  - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [reduceMotion, rawX, rawY]);

    /* Derived parallax layers */
    const gridX   = useTransform(rawX, v => reduceMotion ? 0 : v * 12);
    const gridY_m = useTransform(rawY, v => reduceMotion ? 0 : v * 6);
    const blobAX  = useTransform(rawX, v => reduceMotion ? 0 : v * -20);
    const blobAY  = useTransform(rawY, v => reduceMotion ? 0 : v * -12);
    const blobBX  = useTransform(rawX, v => reduceMotion ? 0 : v * 14);
    const blobBY  = useTransform(rawY, v => reduceMotion ? 0 : v * 8);
    const panelRX = useTransform(rawX, v => reduceMotion ? 0 : v * -16);
    const panelLX = useTransform(rawX, v => reduceMotion ? 0 : v * 14);

    /* ── Scroll transforms ─────────────────────────────────── */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const scrollGridY   = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -40]);
    const contentY      = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -75]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.48], [1, 0]);

    /* Combined grid Y (mouse + scroll) */
    const gridYCombined = useTransform(
        [gridY_m, scrollGridY] as const,
        ([my, sy]: number[]) => my + sy,
    );

    /* ─────────────────────────────────────────────────────── */
    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-[#fafafc]"
            aria-label="Hero"
        >

            {/* ═══════════════════════════════════════════════
                LIGHT BACKGROUND SYSTEM
            ═══════════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>

                {/* 1 · Soft particle field — dark dots on light, barely visible */}
                <ParticleField variant="light" count={36} opacity={0.55} />

                {/* 2 · Thin tech grid — mouse + scroll parallax */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        x: gridX,
                        y: gridYCombined,
                        backgroundImage: [
                            "linear-gradient(rgba(10,12,16,0.045) 1px, transparent 1px)",
                            "linear-gradient(90deg, rgba(10,12,16,0.045) 1px, transparent 1px)",
                        ].join(", "),
                        backgroundSize: "80px 80px",
                    }}
                />

                {/* 3 · Mesh blob A — warm gold, top-right */}
                <motion.div
                    className="absolute -top-36 -right-36 h-[580px] w-[580px] rounded-full bg-[#e6c800] blur-[200px] opacity-[0.09]"
                    style={{ x: blobAX, y: blobAY }}
                    animate={reduceMotion ? {} : {
                        scale: [1, 1.09, 0.96, 1],
                        x:     [0,  36, -12,  0],
                        y:     [0, -24,  16,  0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 4 · Mesh blob B — cool slate shadow, bottom-left */}
                <motion.div
                    className="absolute -bottom-36 -left-36 h-[500px] w-[500px] rounded-full bg-slate-300 blur-[180px] opacity-[0.22]"
                    style={{ x: blobBX, y: blobBY }}
                    animate={reduceMotion ? {} : {
                        scale: [1, 1.07, 0.94, 1],
                        x:     [0, -26,  10,  0],
                        y:     [0,  30, -12,  0],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                />

                {/* 5 · Centre shimmer — ultra-subtle warm haze */}
                <motion.div
                    className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[900px] rounded-full bg-[#e6c800] blur-[220px] opacity-[0.04]"
                    animate={reduceMotion ? {} : {
                        scaleX: [1, 1.14, 0.92, 1],
                        scaleY: [1, 0.86, 1.10, 1],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* 6 · Decorative concentric rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full border border-[#0a0c10]/[0.032]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1060px] h-[1060px] rounded-full border border-[#0a0c10]/[0.018]" />

                {/* 7 · Accent horizon lines */}
                <div className="absolute top-[29%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/18 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0a0c10]/[0.05] to-transparent" />

                {/* 8 · Radial centre vignette — edges softer */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_42%,transparent_35%,rgba(250,250,252,0.55)_100%)]" />
            </div>

            {/* ═══════════════════════════════════════════════
                FLOATING PANEL — right: platform metrics
            ═══════════════════════════════════════════════ */}
            <motion.div
                className="absolute top-[14%] right-[4%] z-[5] hidden xl:block pointer-events-none"
                style={{ x: panelRX }}
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: reduceMotion ? 0 : 1, scale: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    animate={reduceMotion ? {} : { y: [0, -10, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-[220px] rounded-2xl bg-white/85 border border-[#0a0c10]/[0.07] backdrop-blur-xl shadow-[0_12px_56px_rgba(0,0,0,0.07),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a0c10]/[0.05]">
                            <div className="flex items-center gap-2">
                                <motion.span
                                    className="w-1.5 h-1.5 rounded-full bg-[#e6c800]"
                                    animate={{ opacity: [1, 0.25, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0a0c10]/42">
                                    PLATFORM
                                </span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#e6c800]">
                                LIVE
                            </span>
                        </div>
                        {/* Metric rows */}
                        <div className="p-4 space-y-3.5">
                            {METRICS.map((m, i) => (
                                <div key={m.label}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-[#0a0c10]/38">
                                            {m.label}
                                        </span>
                                        <span className="text-[8px] font-black text-[#0a0c10]">
                                            {m.value}
                                        </span>
                                    </div>
                                    <div className="h-[3px] rounded-full bg-[#0a0c10]/[0.07] overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-[#c9ad00] to-[#e6c800]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${m.bar}%` }}
                                            transition={{
                                                delay: 1.6 + i * 0.18,
                                                duration: 1.2,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                FLOATING PANEL — left: system status
            ═══════════════════════════════════════════════ */}
            <motion.div
                className="absolute top-[37%] left-[3%] z-[5] hidden xl:block pointer-events-none"
                style={{ x: panelLX }}
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: reduceMotion ? 0 : 1, scale: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    animate={reduceMotion ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <div className="w-[196px] rounded-2xl bg-white/85 border border-[#0a0c10]/[0.07] backdrop-blur-xl shadow-[0_12px_56px_rgba(0,0,0,0.07),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a0c10]/[0.05]">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0a0c10]/42">
                                SYS_STATUS
                            </span>
                            <Cpu size={10} className="text-[#0a0c10]/28" />
                        </div>
                        {/* Node rows */}
                        <div className="p-4 space-y-2.5">
                            {SYS_NODES.map((node) => (
                                <div key={node.label} className="flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[#0a0c10]/35">
                                        {node.label}
                                    </span>
                                    <span
                                        className={`flex items-center gap-1.5 text-[8px] font-black ${
                                            node.live ? "text-[#c9ad00]" : "text-[#0a0c10]/28"
                                        }`}
                                    >
                                        <motion.span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                node.live ? "bg-[#e6c800]" : "bg-[#0a0c10]/15"
                                            }`}
                                            animate={node.live ? { opacity: [1, 0.25, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 2.2 }}
                                        />
                                        {node.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════ */}
            <motion.div
                className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ y: contentY, opacity: contentOpacity }}
            >

                {/* Eyebrow pill */}
                <motion.div
                    variants={createRevealUp(reduceMotion, 16, 5)}
                    className="mb-9"
                >
                    <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#0a0c10]/[0.04] border border-[#0a0c10]/[0.08] text-[#0a0c10]/62 text-[10px] font-black uppercase tracking-[0.28em]">
                        <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-[#e6c800]"
                            animate={{ opacity: [1, 0.22, 1] }}
                            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                            aria-hidden
                        />
                        Yazılım · Otomasyon · Dijital Dönüşüm
                    </span>
                </motion.div>

                {/* H1 — two-line word-by-word stagger */}
                <h1 className="font-display font-black text-[clamp(46px,6.8vw,96px)] leading-[0.88] tracking-tight mb-9 max-w-[900px]">

                    {/* Line 1 — dark */}
                    <span className="block">
                        <motion.span
                            className="inline-flex flex-wrap justify-center gap-x-[0.22em]"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {LINE1.map((word, i) => (
                                <motion.span
                                    key={word}
                                    className="inline-block text-[#0a0c10]"
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            y:      reduceMotion ? 0 : 50,
                                            filter: reduceMotion ? "blur(0px)" : "blur(11px)",
                                        },
                                        visible: {
                                            opacity: 1,
                                            y:       0,
                                            filter:  "blur(0px)",
                                            transition: {
                                                duration: 0.80,
                                                ease:     [0.22, 1, 0.36, 1],
                                                delay:    i * 0.11,
                                            },
                                        },
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.span>
                    </span>

                    {/* Line 2 — gold */}
                    <span className="block mt-2">
                        <motion.span
                            className="inline-flex flex-wrap justify-center gap-x-[0.22em]"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {LINE2.map((word, i) => (
                                <motion.span
                                    key={word}
                                    className="inline-block text-[#e6c800]"
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            y:      reduceMotion ? 0 : 50,
                                            filter: reduceMotion ? "blur(0px)" : "blur(11px)",
                                        },
                                        visible: {
                                            opacity: 1,
                                            y:       0,
                                            filter:  "blur(0px)",
                                            transition: {
                                                duration: 0.80,
                                                ease:     [0.22, 1, 0.36, 1],
                                                delay:    0.28 + i * 0.11,
                                            },
                                        },
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.span>
                    </span>
                </h1>

                {/* Subtext */}
                <motion.p
                    variants={createRevealUp(reduceMotion, 28, 8)}
                    className="max-w-[500px] text-[16px] text-[#0a0c10]/52 font-medium leading-[1.76] mb-12"
                >
                    ZYGSOFT; yazılım platformları, otomasyon sistemleri ve dijital dönüşüm
                    çözümleri geliştirerek kurumların teknoloji altyapısını yeniden inşa eder.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    variants={createRevealUp(reduceMotion, 24, 8)}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                >
                    {/* Primary — yellow */}
                    <Magnetic strength={16}>
                        <Link
                            href="/abonelikler"
                            className="group inline-flex items-center gap-3 px-9 py-[18px] rounded-2xl bg-[#e6c800] text-[#0a0c10] text-[11px] font-black uppercase tracking-[0.26em] shadow-[0_14px_56px_rgba(230,200,0,0.32)] hover:shadow-[0_20px_72px_rgba(230,200,0,0.45)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-300"
                        >
                            Platformu Keşfet
                            <ArrowRight
                                size={15}
                                className="group-hover:translate-x-1.5 transition-transform duration-300"
                            />
                        </Link>
                    </Magnetic>

                    {/* Secondary — dark */}
                    <Magnetic strength={12}>
                        <Link
                            href="/portfolio"
                            className="group inline-flex items-center gap-3 px-9 py-[18px] rounded-2xl bg-[#0a0c10] text-white text-[11px] font-black uppercase tracking-[0.26em] shadow-[0_14px_48px_rgba(10,12,16,0.18)] hover:bg-[#1a1c24] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                        >
                            Projelerimizi Gör
                            <ArrowRight
                                size={15}
                                className="group-hover:translate-x-1.5 transition-transform duration-300"
                            />
                        </Link>
                    </Magnetic>
                </motion.div>

                {/* Stats strip */}
                <motion.div
                    variants={createRevealUp(reduceMotion, 20, 6)}
                    className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5"
                >
                    {STATS.map((stat, i) => (
                        <div key={stat.label} className="flex items-center gap-12">
                            <div className="text-center">
                                <p className="text-[28px] font-black text-[#0a0c10] leading-none mb-1 tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0c10]/38">
                                    {stat.label}
                                </p>
                            </div>
                            {i < STATS.length - 1 && (
                                <div className="w-px h-10 bg-[#0a0c10]/[0.1]" aria-hidden />
                            )}
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                SCROLL INDICATOR
            ═══════════════════════════════════════════════ */}
            <motion.div
                className="absolute bottom-9 left-1/2 -translate-x-1/2 z-10"
                style={{ opacity: contentOpacity }}
                aria-hidden
            >
                <motion.div
                    className="flex flex-col items-center gap-1.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.1, duration: 0.7 }}
                >
                    <span className="text-[9px] font-black uppercase tracking-[0.36em] text-[#0a0c10]/22">
                        Keşfet
                    </span>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}
                    >
                        <ChevronDown size={15} className="text-[#0a0c10]/20" />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Bottom blend into section 02 */}
            <div
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[#fafafc] pointer-events-none"
                aria-hidden
            />
        </section>
    );
}
