"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { HomepageBlogGrid } from "./HomepageBlogGrid";
import type { BlogPostCardData } from "./BlogPostCard";

export function HomepageBlogSection() {
    const locale = useLocale();
    const t = useTranslations("Blog");
    const [posts, setPosts] = useState<BlogPostCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blog?limit=3")
            .then((res) => res.json())
            .then((data) => {
                const list = data.posts ?? [];
                setPosts(list.slice(0, 3));
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="py-28 relative overflow-hidden" style={{ background: "#f3f0ea" }}>
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(#0a0c10 1px, transparent 1px), linear-gradient(90deg, #0a0c10 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#0a0c10]/50 mb-5 block">
                            {t("blogTag")}
                        </span>
                        <h2 className="font-display font-extrabold text-[clamp(32px,3.5vw,48px)] leading-tight text-[#0e0e0e] mt-2 mb-3">
                            {t("blogTitle")}
                        </h2>
                        <p className="text-[#0a0c10]/60 text-base max-w-md">
                            {t("blogDesc")}
                        </p>
                    </div>
                    <Link
                        href={locale === "tr" ? "/blog" : `/${locale}/blog`}
                        className="inline-flex items-center gap-2 px-6 py-3 font-black uppercase tracking-[0.22em] text-[11px] rounded-xl border-2 border-[#0a0c10] text-[#0a0c10] hover:bg-[#0a0c10] hover:text-[#e6c800] transition-all duration-300"
                    >
                        {t("blogButton")}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <HomepageBlogGrid posts={posts} locale={locale} loading={loading} />
            </div>
        </section>
    );
}
