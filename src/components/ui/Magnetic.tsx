"use client";

import { useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function Magnetic({ children, className = "", strength = 20 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Track mouse position relative to center of element
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth physics
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();

        // Calculate distance from center
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Convert to constrained movement
        x.set((clientX - centerX) * (strength / 100));
        y.set((clientY - centerY) * (strength / 100));
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        // Reset to center
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            initial={{ x: 0, y: 0 }}
            style={{ x: springX, y: springY }}
            className={`cursor-pointer inline-flex ${className}`}
            data-magnetic="true"
        >
            {children}
        </motion.div>
    );
}
