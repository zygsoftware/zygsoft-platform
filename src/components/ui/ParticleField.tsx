"use client";

import { useRef, useEffect, useMemo, useState } from "react";

interface ParticleFieldProps {
    className?: string;
    /** Number of particles (keep low for performance) */
    count?: number;
    /** "light" = dark dots on light, "dark" = light dots on dark */
    variant?: "light" | "dark";
    /** Opacity 0–1 */
    opacity?: number;
    /** Disable when prefers-reduced-motion */
    respectReducedMotion?: boolean;
}

const DEFAULT_COUNT = 40;
const PARTICLE_COLOR_LIGHT = "rgba(10, 12, 16, 0.12)";
const PARTICLE_COLOR_DARK = "rgba(255, 255, 255, 0.15)";

export function ParticleField({
    className = "",
    count = DEFAULT_COUNT,
    variant = "light",
    opacity = 1,
    respectReducedMotion = true,
}: ParticleFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !respectReducedMotion) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const handler = () => setReducedMotion(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [respectReducedMotion]);

    const particles = useMemo(() => {
        if (reducedMotion) return [];
        return Array.from({ length: count }, () => ({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.00015,
            vy: (Math.random() - 0.5) * 0.00015,
            r: 0.5 + Math.random() * 1,
        }));
    }, [count, reducedMotion]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || particles.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        const color = variant === "dark" ? PARTICLE_COLOR_DARK : PARTICLE_COLOR_LIGHT;

        const draw = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;

                const x = p.x * width;
                const y = p.y * height;
                ctx.beginPath();
                ctx.arc(x, y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            raf = requestAnimationFrame(draw);
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener("resize", resize);
        draw();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [particles, variant, opacity]);

    if (reducedMotion && respectReducedMotion) return null;

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            aria-hidden
        />
    );
}
