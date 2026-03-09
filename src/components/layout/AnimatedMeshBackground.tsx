"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export function AnimatedMeshBackground() {
    const { scrollY } = useScroll();
    const yRotate = useTransform(scrollY, [0, 4000], [0, 45]);
    const xRotate = useTransform(scrollY, [0, 4000], [0, 15]);
    const zTranslate = useTransform(scrollY, [0, 4000], [0, -200]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white">
            <motion.div
                style={{
                    rotateX: xRotate,
                    rotateY: yRotate,
                    translateZ: zTranslate,
                    transformStyle: "preserve-3d"
                }}
                className="absolute inset[-50%] w-[200%] h-[200%] -left-[50%] -top-[50%]"
            >
                <div
                    className="w-full h-full opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                    }}
                />

                {/* Flowing Light Blob */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#e6c800] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-2/3 right-1/4 w-[600px] h-[600px] bg-slate-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
            </motion.div>
        </div>
    );
}
