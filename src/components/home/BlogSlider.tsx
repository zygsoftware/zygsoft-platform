"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { createHeadingReveal, createRevealUp, revealViewport } from "@/components/ui/motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    publishedAt: string | null;
    tags: string[];
    author: {
        name: string;
    };
};

export function BlogSlider() {
    const t = useTranslations("Blog");
    const locale = useLocale();
    const reducedMotion = !!useReducedMotion();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch("/api/blog?published=true");
                const data = await res.json();
                // Take only the latest 6 posts
                if (data.posts) {
                    setPosts(data.posts.slice(0, 6));
                }
            } catch (error) {
                console.error("Failed to fetch blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <section className="py-28 relative overflow-hidden" style={{ background: "#f3f0ea" }}>
            <div className="absolute inset-0 pointer-events-none" />


            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
                    <motion.div
                        variants={createRevealUp(reducedMotion, 40, 8)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={revealViewport}
                    >
                        <span className="section-label">{t("blogTag")}</span>
                        <motion.h2
                            variants={createHeadingReveal(reducedMotion)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={revealViewport}
                            className="font-display font-extrabold text-[clamp(32px,3.5vw,48px)] leading-tight text-[#0e0e0e] mt-2 mb-3"
                        >
                            {t("blogTitle")}
                        </motion.h2>
                        <p className="text-[#888] text-base max-w-md">{t("blogDesc")}</p>
                    </motion.div>
                    <motion.div
                        variants={createRevealUp(reducedMotion, 32, 8)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={revealViewport}
                        transition={{ delay: 0.08 }}
                    >
                        <Link
                            href="/blog"
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            {t("blogButton")} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    variants={createRevealUp(reducedMotion, 40, 8)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={revealViewport}
                    transition={{ delay: 0.12 }}
                >
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true, dynamicBullets: true }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="!pb-14"
                    >
                        {loading ? (
                            <SwiperSlide>
                                <div className="h-[380px] bg-white border border-black/8 rounded-sm flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-black/20 border-t-[#e6c800] rounded-full animate-spin" />
                                </div>
                            </SwiperSlide>
                        ) : posts.length === 0 ? (
                            <SwiperSlide>
                                <div className="h-[380px] bg-white border border-black/8 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-8">
                                    <BookOpen size={48} className="text-black/20 mb-4" />
                                    <h3 className="text-xl font-bold text-[#0e0e0e] mb-2">{t("noPostsYet")}</h3>
                                    <p className="text-[#888] text-sm max-w-xs">{t("emptyDesc")}</p>
                                </div>
                            </SwiperSlide>
                        ) : (
                            posts.map((post) => (
                                <SwiperSlide key={post.id} className="h-auto">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="block h-full group"
                                    >
                                        <div className="h-full flex flex-col bg-white border border-black/8 rounded-sm overflow-hidden hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                                            {/* Cover */}
                                            <div className="relative h-48 w-full bg-[#f3f0ea] overflow-hidden">
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-black/15">
                                                        <BookOpen size={40} />
                                                    </div>
                                                )}
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="absolute bottom-3 left-4">
                                                        <span className="tag-yellow text-[10px]">{post.tags[0]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-3 text-xs text-[#888] mb-3 font-medium">
                                                    <span>{post.author.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-black/15" />
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {post.publishedAt
                                                            ? new Date(post.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })
                                                            : t("new")
                                                        }
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-display font-bold text-[#0e0e0e] mb-2 line-clamp-2 group-hover:text-[#555] transition-colors">
                                                    {post.title}
                                                </h3>

                                                <p className="text-[#888] text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex items-center text-[#0e0e0e] text-sm font-bold mt-auto">
                                                    {t("readNow")} <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            ))
                        )}
                    </Swiper>
                </motion.div>
            </div>

            <style jsx global>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #0a0c10 !important;
                    background: rgba(230,200,0,0.18);
                    width: 42px !important;
                    height: 42px !important;
                    border-radius: 50%;
                    border: 1px solid rgba(230,200,0,0.5);
                    transition: all 0.2s ease;
                }
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: rgba(230,200,0,0.3);
                    border-color: rgba(230,200,0,0.8);
                }
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 16px !important;
                    font-weight: bold;
                }
                .swiper-pagination-bullet {
                    background: rgba(10,12,16,0.2) !important;
                }
                .swiper-pagination-bullet-active {
                    background: #e6c800 !important;
                }
            `}</style>
        </section>
    );
}
