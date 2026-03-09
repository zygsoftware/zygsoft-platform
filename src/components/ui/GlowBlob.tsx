"use client";

import { motion } from "framer-motion";

interface GlowBlobProps {
    className?: string;
    color?: string;
    delay?: number;
}

export function GlowBlob({ className = "", color = "bg-[#e6c800]", delay = 0 }: GlowBlobProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.05, 1],
                x: [0, 30, -20, 0],
                y: [0, -20, 20, 0],
            }}
            transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
            className={`absolute blur-[120px] rounded-full mix-blend-multiply pointer-events-none will-change-transform ${color} ${className}`}
            style={{
                width: "500px",
                height: "500px",
                transform: "translate3d(0,0,0)"
            }}
        />
    );
}
