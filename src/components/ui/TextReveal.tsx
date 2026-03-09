import { motion } from "framer-motion";

interface TextRevealProps {
    children: string;
    delay?: number;
    className?: string;
    as?: any;
}

export function TextReveal({ children, delay = 0, className = "", as: Component = "span" }: TextRevealProps) {
    // Split the text into lines, then mask those lines so words pop up.
    // For simpler global usage, we'll split by spaces into words to avoid complex resizing calculations.

    const words = children.split(" ");

    return (
        <Component className={`${className} inline-flex flex-wrap gap-x-[0.25em] gap-y-2`}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 -mb-1 align-bottom">
                    <motion.span
                        className="inline-block"
                        initial={{ y: "110%" }}
                        whileInView={{ y: "0%" }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{
                            duration: 0.8,
                            ease: [0.76, 0, 0.24, 1],
                            delay: delay + i * 0.04,
                        }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </Component>
    );
}
