import type { Variants } from "framer-motion";

export const revealViewport = { once: true, margin: "-120px" } as const;

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.04,
        },
    },
};

export const createRevealUp = (reducedMotion: boolean, y = 40, blur = 8): Variants => ({
    hidden: {
        opacity: 0,
        y: reducedMotion ? 0 : y,
        filter: reducedMotion ? "blur(0px)" : `blur(${blur}px)`,
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
});

export const createHeadingReveal = (reducedMotion: boolean): Variants => ({
    hidden: {
        opacity: 0,
        y: reducedMotion ? 0 : 60,
        filter: reducedMotion ? "blur(0px)" : "blur(12px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
        },
    },
});

