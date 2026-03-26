"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const prefersTouch = window.matchMedia("(pointer: coarse)").matches;
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const isHomepage = /^\/(?:tr|en)?\/?$/.test(pathname || "/");

        // Homepage keeps native scrolling for smoother section-to-section performance.
        if (prefersReducedMotion || prefersTouch || !isDesktop || isHomepage) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.02,
            touchMultiplier: 1,
        });

        let rafId = 0;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [pathname]);

    return <>{children}</>;
}
