"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    /** Max tilt in degrees (e.g. 8) */
    maxTilt?: number;
    /** Disable when prefers-reduced-motion */
    respectReducedMotion?: boolean;
}

export function TiltCard({
    children,
    className = "",
    maxTilt = 8,
    respectReducedMotion = true,
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !respectReducedMotion) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const handler = () => setReducedMotion(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [respectReducedMotion]);

    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const springConfig = { damping: 25, stiffness: 200 };
    const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
    const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (reducedMotion) return;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        x.set(nx);
        y.set(ny);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    if (reducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
