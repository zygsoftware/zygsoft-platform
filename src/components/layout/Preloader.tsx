"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [counter, setCounter] = useState(0);
    const [phase, setPhase] = useState<"initial" | "split" | "fadeText" | "exit">("initial");
    const pathname = usePathname();

    useEffect(() => {
        // Authenticated panel areas don't need the intro preloader.
        // Navigating between dashboard / admin sub-pages should feel instant.
        if (pathname.includes("/dashboard") || pathname.includes("/panel") || pathname.includes("/admin")) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setCounter(0);
        setPhase("initial");

        // Fast counter from 0 to 100
        const duration = 1200; // 1.2s total count
        const intervalTime = 15;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const progress = Math.min(Math.floor((currentStep / steps) * 100), 100);
            setCounter(progress);

            if (currentStep >= steps) {
                clearInterval(interval);

                // Timeline of operations 
                // 1. Morph text to Z:Y:G SOFTWARE
                setTimeout(() => setPhase("split"), 150);

                // 2. Fade out the text
                setTimeout(() => setPhase("fadeText"), 1100);

                // 3. Split the screen curtains
                setTimeout(() => {
                    setPhase("exit");
                    setTimeout(() => setIsLoading(false), 900);
                }, 1400);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [pathname]);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <div className="fixed inset-0 z-[99999] pointer-events-none flex">

                    {/* Left Curtain */}
                    <motion.div
                        className="w-1/2 h-full bg-[#1e1c1c] relative border-r border-white/[0.02]"
                        initial={{ x: 0 }}
                        animate={{ x: phase === "exit" ? "-100%" : 0 }}
                        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                    >
                        {/* Status bar items on left half */}
                        <motion.div animate={{ opacity: phase === "exit" ? 0 : 1 }} transition={{ duration: 0.5 }}>
                            <div className="absolute top-8 left-8 md:top-12 md:left-12 text-white/40 font-bold text-[10px] md:text-[12px] tracking-[0.3em] uppercase">
                                ZYGSOFT INC.
                            </div>
                            <div className="absolute bottom-10 left-8 md:bottom-14 md:left-12 flex flex-col gap-3">
                                <div className="text-white text-[28px] md:text-[40px] tabular-nums leading-none font-black tracking-tight">
                                    {counter}%
                                </div>
                                <div className="h-[2px] w-[120px] md:w-[200px] bg-white/[0.08] rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-[#e6c800]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${counter}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Curtain */}
                    <motion.div
                        className="w-1/2 h-full bg-[#1e1c1c] relative"
                        initial={{ x: 0 }}
                        animate={{ x: phase === "exit" ? "100%" : 0 }}
                        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                    >
                        {/* Status bar items on right half */}
                        <motion.div animate={{ opacity: phase === "exit" ? 0 : 1 }} transition={{ duration: 0.5 }}>
                            <div className="absolute top-8 right-8 md:top-12 md:right-12 text-white/40 font-bold text-[10px] md:text-[12px] tracking-[0.3em] uppercase">
                                DIGITAL PLATFORM
                            </div>
                            <div className="absolute bottom-10 right-8 md:bottom-14 md:right-12 text-white/30 text-[9px] md:text-[11px] font-medium tracking-[0.2em] uppercase max-w-[150px] text-right">
                                SYSTEM INITIALIZATION...
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Center Text Container */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center font-display font-black text-[clamp(40px,8vw,120px)] text-white tracking-[-0.03em] overflow-hidden drop-shadow-2xl"
                        animate={{ opacity: phase === "fadeText" || phase === "exit" ? 0 : 1 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <div className="flex items-center justify-center space-x-2 md:space-x-4">
                            {/* ZYG Side */}
                            <motion.div
                                className="flex"
                                animate={{
                                    x: phase === "split" ? -24 : 0,
                                    letterSpacing: phase === "split" ? "0.05em" : "0em"
                                }}
                                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            >
                                Z
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden text-[#e6c800]"
                                >.</motion.span>
                                Y
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden text-[#e6c800]"
                                >.</motion.span>
                                G
                            </motion.div>

                            {/* SOFT -> SOFTWARE Side */}
                            <motion.div
                                className="flex text-[#e6c800]"
                                animate={{
                                    x: phase === "split" ? 24 : 0,
                                }}
                                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            >
                                SOFT
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden text-white"
                                >WARE</motion.span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
