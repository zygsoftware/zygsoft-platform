"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createRevealUp, revealViewport } from "@/components/ui/motion";
import { BlogPostCard, type BlogPostCardData } from "./BlogPostCard";
import { BookOpen } from "lucide-react";

type HomepageBlogGridProps = {
    posts: BlogPostCardData[];
    locale: string;
    loading?: boolean;
};

export function HomepageBlogGrid({ posts, locale, loading = false }: HomepageBlogGridProps) {
    const reducedMotion = !!useReducedMotion();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[380px] bg-white/60 border border-[#0a0c10]/[0.06] rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[320px] bg-white/60 border border-[#0a0c10]/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-8"
            >
                <BookOpen size={48} className="text-[#0a0c10]/20 mb-4" />
                <h3 className="text-xl font-display font-bold text-[#0e0e0e] mb-2">
                    {locale === "tr" ? "Henüz yazı yok" : "No posts yet"}
                </h3>
                <p className="text-[#0a0c10]/50 text-sm max-w-xs">
                    {locale === "tr" ? "Yakında yeni içerikler eklenecek." : "New content coming soon."}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            variants={{
                hidden: {},
                visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.03 },
                },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
        >
            {posts.map((post, i) => (
                <motion.div key={post.id} variants={createRevealUp(reducedMotion, 28, 6)}>
                    <BlogPostCard post={post} locale={locale} variant="default" index={i} />
                </motion.div>
            ))}
        </motion.div>
    );
}
