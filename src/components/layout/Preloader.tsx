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
                setTimeout(() => setPhase("split"), 200);

                // 2. Fade out the text
                setTimeout(() => setPhase("fadeText"), 1800);

                // 3. Split the screen curtains
                setTimeout(() => {
                    setPhase("exit");
                    setTimeout(() => setIsLoading(false), 1200); // 1.2s for curtain exit
                }, 2400);
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
                        className="w-1/2 h-full bg-white relative"
                        initial={{ x: 0 }}
                        animate={{ x: phase === "exit" ? "-100%" : 0 }}
                        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    >
                        {/* Status bar items on left half */}
                        <motion.div animate={{ opacity: phase === "exit" ? 0 : 1 }} transition={{ duration: 0.5 }}>
                            <div className="absolute top-6 left-6 md:top-10 md:left-10 text-slate-950 font-bold text-[12px] md:text-[14px]">
                                ZYGSOFT INC.
                            </div>
                            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-slate-950 font-bold text-[18px] md:text-[22px] tabular-nums leading-none">
                                {counter}%
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Curtain */}
                    <motion.div
                        className="w-1/2 h-full bg-white relative"
                        initial={{ x: 0 }}
                        animate={{ x: phase === "exit" ? "100%" : 0 }}
                        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    >
                        {/* Status bar items on right half */}
                        <motion.div animate={{ opacity: phase === "exit" ? 0 : 1 }} transition={{ duration: 0.5 }}>
                            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-950 font-bold text-[12px] md:text-[14px]">
                                PROJECT DETAILS +
                            </div>
                            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 text-slate-950 text-[10px] md:text-[12px] font-medium opacity-60">
                                WE USE COOKIES...
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Center Text Container */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center font-display font-black text-[clamp(40px,8vw,120px)] text-slate-950 tracking-[-0.03em] overflow-hidden"
                        animate={{ opacity: phase === "fadeText" || phase === "exit" ? 0 : 1 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        <div className="flex items-center justify-center space-x-2 md:space-x-4">
                            {/* ZYG Side */}
                            <motion.div
                                className="flex"
                                animate={{
                                    x: phase === "split" ? -20 : 0,
                                    letterSpacing: phase === "split" ? "0.1em" : "0em"
                                }}
                                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                            >
                                Z
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden"
                                >.</motion.span>
                                Y
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden"
                                >.</motion.span>
                                G
                            </motion.div>

                            {/* SOFT -> SOFTWARE Side */}
                            <motion.div
                                className="flex text-[#e6c800]"
                                animate={{
                                    x: phase === "split" ? 20 : 0,
                                }}
                                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                            >
                                SOFT
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: phase === "split" ? "auto" : 0, opacity: phase === "split" ? 1 : 0 }}
                                    className="overflow-hidden"
                                >WARE</motion.span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
