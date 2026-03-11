import type { Variants } from "framer-motion";

export const revealViewport = { once: true, amount: 0.08, margin: "0px 0px -80px 0px" } as const;

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.03,
        },
    },
};

export const createRevealUp = (reducedMotion: boolean, y = 36, blur = 6): Variants => ({
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
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
});

export const createHeadingReveal = (reducedMotion: boolean): Variants => ({
    hidden: {
        opacity: 0,
        y: reducedMotion ? 0 : 20,
        filter: reducedMotion ? "blur(0px)" : "blur(4px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
});

