"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [hidden, setHidden] = useState(true);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Dynamic spring physics for a "trailing" effect
    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const springConfigTrailing = { damping: 25, stiffness: 100, mass: 0.8 };

    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const trailingXSpring = useSpring(cursorX, springConfigTrailing);
    const trailingYSpring = useSpring(cursorY, springConfigTrailing);

    useEffect(() => {
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

        const handleMouseLeave = () => {
            setHidden(true);
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [cursorX, cursorY, hidden]);

    if (typeof window === "undefined") return null;

    return (
        <>
            {/* Center Dot */}
            <motion.div
                className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-slate-950 pointer-events-none z-[100000] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: hidden ? 0 : 1,
                }}
            />
            {/* Trailing Ring */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 rounded-full border border-slate-950/20 pointer-events-none z-[99999] hidden md:block"
                style={{
                    x: trailingXSpring,
                    y: trailingYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    scale: hidden ? 0 : isHovered ? 1.5 : 1,
                    opacity: hidden ? 0 : 1,
                    backgroundColor: isHovered ? "rgba(0,0,0,0.02)" : "transparent",
                }}
                transition={{
                    scale: { duration: 0.3, ease: "easeOut" }
                }}
            />
        </>
    );
}
