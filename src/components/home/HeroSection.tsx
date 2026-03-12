"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown, Cpu } from "lucide-react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("Homepage.hero");
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

    /* Parallax for floating panels only */
    const panelRX = useTransform(rawX, v => reduceMotion ? 0 : v * -8);
    const panelLX = useTransform(rawX, v => reduceMotion ? 0 : v * 8);

    /* Scroll transforms for content */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const contentY      = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -60]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.48], [1, 0]);

    /* ─────────────────────────────────────────────────────── */
    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-[#fafafc]"
            aria-label="Hero"
        >

            {/* ═══════════════════════════════════════════════
                LIGHT BACKGROUND — minimal, premium
            ═══════════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
                {/* Single subtle grid — static, no parallax for calmer feel */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: [
                            "linear-gradient(rgba(10,12,16,0.02) 1px, transparent 1px)",
                            "linear-gradient(90deg, rgba(10,12,16,0.02) 1px, transparent 1px)",
                        ].join(", "),
                        backgroundSize: "120px 120px",
                    }}
                />
            </div>

            {/* ═══════════════════════════════════════════════
                FLOATING PANELS — refined, calmer
            ═══════════════════════════════════════════════ */}
            <motion.div
                className="absolute top-[16%] right-[5%] z-[5] hidden xl:block pointer-events-none"
                style={{ x: panelRX }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: reduceMotion ? 0 : 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="w-[200px] rounded-xl bg-white/90 border border-[#0a0c10]/[0.06] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#0a0c10]/[0.04]">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a0c10]/50">Platform</span>
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#e6c800]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]" />
                            Live
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        {METRICS.map((m, i) => (
                            <div key={m.label}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#0a0c10]/45">{m.label}</span>
                                    <span className="text-[9px] font-bold text-[#0a0c10]">{m.value}</span>
                                </div>
                                <div className="h-[2px] rounded-full bg-[#0a0c10]/[0.06] overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-[#e6c800]/80"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${m.bar}%` }}
                                        transition={{ delay: 1.4 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute top-[38%] left-[5%] z-[5] hidden xl:block pointer-events-none"
                style={{ x: panelLX }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: reduceMotion ? 0 : 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="w-[180px] rounded-xl bg-white/90 border border-[#0a0c10]/[0.06] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#0a0c10]/[0.04]">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a0c10]/50">Status</span>
                        <Cpu size={10} className="text-[#0a0c10]/25" />
                    </div>
                    <div className="p-4 space-y-2">
                        {SYS_NODES.map((node) => (
                            <div key={node.label} className="flex items-center justify-between">
                                <span className="text-[9px] font-medium text-[#0a0c10]/45">{node.label}</span>
                                <span className={`flex items-center gap-1 text-[9px] font-bold ${node.live ? "text-[#c9ad00]" : "text-[#0a0c10]/30"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${node.live ? "bg-[#e6c800]" : "bg-[#0a0c10]/12"}`} />
                                    {node.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
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

                {/* Eyebrow */}
                <motion.div
                    variants={createRevealUp(reduceMotion, 12, 4)}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0c10]/[0.03] border border-[#0a0c10]/[0.06] text-[#0a0c10]/55 text-[10px] font-bold uppercase tracking-[0.24em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e6c800]/90" aria-hidden />
                        {t("eyebrow")}
                    </span>
                </motion.div>

                {/* H1 */}
                <h1 className="font-display font-black text-[clamp(44px,6.2vw,88px)] leading-[0.9] tracking-tight mb-8 max-w-[820px]">

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
                                            y:      reduceMotion ? 0 : 28,
                                            filter: reduceMotion ? "blur(0px)" : "blur(6px)",
                                        },
                                        visible: {
                                            opacity: 1,
                                            y:       0,
                                            filter:  "blur(0px)",
                                            transition: {
                                                duration: 0.6,
                                                ease:     [0.22, 1, 0.36, 1],
                                                delay:    i * 0.08,
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
                                            y:      reduceMotion ? 0 : 28,
                                            filter: reduceMotion ? "blur(0px)" : "blur(6px)",
                                        },
                                        visible: {
                                            opacity: 1,
                                            y:       0,
                                            filter:  "blur(0px)",
                                            transition: {
                                                duration: 0.6,
                                                ease:     [0.22, 1, 0.36, 1],
                                                delay:    (LINE1.length + i) * 0.08,
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
                    variants={createRevealUp(reduceMotion, 20, 6)}
                    className="max-w-[440px] text-[15px] md:text-[16px] text-[#0a0c10]/55 font-medium leading-[1.65] mb-9"
                >
                    {t("subtext")}
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    variants={createRevealUp(reduceMotion, 24, 8)}
                    className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-16"
                >
                    {/* Primary — yellow */}
                    <Magnetic strength={16}>
                        <Link
                            href="/dijital-urunler/hukuk-araclari-paketi"
                            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#e6c800] text-[#0a0c10] text-[11px] font-black uppercase tracking-[0.22em] shadow-[0_12px_40px_rgba(230,200,0,0.28)] hover:shadow-[0_16px_48px_rgba(230,200,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            {t("ctaPrimary")}
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
                            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-[0_12px_36px_rgba(10,12,16,0.15)] hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            {t("ctaSecondary")}
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
                        {t("scroll")}
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
