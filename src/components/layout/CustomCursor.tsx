"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [hidden, setHidden] = useState(true);
    const [disabled, setDisabled] = useState(true);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Snappy springs — minimal lag, premium feel
    const springConfig = { damping: 28, stiffness: 220, mass: 0.3 };
    const springConfigTrailing = { damping: 30, stiffness: 180, mass: 0.4 };

    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const trailingXSpring = useSpring(cursorX, springConfigTrailing);
    const trailingYSpring = useSpring(cursorY, springConfigTrailing);

    useEffect(() => {
        // Hide on touch devices
        const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (hasTouch || prefersReducedMotion) {
            setDisabled(true);
            return;
        }
        setDisabled(false);
    }, []);

    useEffect(() => {
        if (disabled) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (hidden) setHidden(false);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button") ||
                target.hasAttribute("data-magnetic")
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        const handleMouseLeave = () => setHidden(true);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [cursorX, cursorY, hidden, disabled]);

    if (typeof window === "undefined" || disabled) return null;

    return (
        <>
            {/* Small solid inner dot */}
            <motion.div
                className="fixed top-0 left-0 w-1 h-1 rounded-full bg-[#0a0c10] pointer-events-none z-[100000] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: hidden ? 0 : 1,
                }}
            />
            {/* Thin outer ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-[0.5px] border-[#0a0c10]/15 pointer-events-none z-[99999] hidden md:block"
                style={{
                    x: trailingXSpring,
                    y: trailingYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    scale: hidden ? 0 : isHovered ? 1.15 : 1,
                    opacity: hidden ? 0 : 1,
                }}
                transition={{ scale: { duration: 0.2, ease: "easeOut" } }}
            />
        </>
    );
}
