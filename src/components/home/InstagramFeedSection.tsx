"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, ExternalLink, Calendar, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { BlockReveal, TextReveal } from "@/components/ui/reveal";

const INSTAGRAM_PROFILE = "https://www.instagram.com/zygsoft/";
const API_ROUTE = "/api/social/instagram?v=1";

type InstagramPost = {
  id: string;
  caption: string | null;
  imageUrl: string;
  permalink: string;
  mediaType: string;
  timestamp: string;
};

type ApiResponse = {
  success: boolean;
  posts: InstagramPost[];
};

function formatDate(iso: string, locale: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const loc = locale === "en" ? "en-US" : "tr-TR";
    return d.toLocaleDateString(loc, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getMediaTypeLabel(type: string, t: (key: string) => string) {
  switch (type?.toUpperCase()) {
    case "VIDEO":
      return t("mediaVideo");
    case "REELS":
      return t("mediaReels");
    case "CAROUSEL_ALBUM":
      return t("mediaCarousel");
    default:
      return t("mediaPost");
  }
}

export function InstagramFeedSection() {
  const locale = useLocale();
  const t = useTranslations("Homepage.instagram");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTE)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setPosts(data.posts ?? []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasPosts = posts.length > 0;

  return (
    <section className="home-snap-section surface-dark py-24 md:py-28 text-white relative overflow-hidden bg-[linear-gradient(180deg,#221f1e_0%,#1a1817_100%)]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#e6c800]/12 blur-3xl pointer-events-none" />
      <div className="absolute left-[-8rem] bottom-[-8rem] h-72 w-72 rounded-full bg-white/[0.05] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <BlockReveal className="max-w-2xl">
            <TextReveal delay={0.05}>
              <span className="text-[10px] font-bold uppercase tracking-[0.32em] !text-white/55 mb-5 block">{t("tag")}</span>
            </TextReveal>
            <TextReveal delay={0.12}>
              <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.92] tracking-tight !text-white uppercase mb-4">
                {t("title")}
              </h2>
            </TextReveal>
            <TextReveal delay={0.18}>
              <p className="!text-white/62 text-[16px] font-medium max-w-md">
                {t("description")}
              </p>
            </TextReveal>
          </BlockReveal>

          <BlockReveal delay={0.12} className="shrink-0">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-bold !text-white/92">
                  <span className="[font-family:var(--font-button)] inline-flex items-center gap-2">
                    <Instagram size={18} /> @zygsoft
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-[0.18em] !text-white/55 [font-family:var(--font-button)]">
                  {locale === "en" ? "Live social feed" : "Canlı sosyal akış"}
                </span>
                <a
                  href={INSTAGRAM_PROFILE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e6c800] !text-[#343131] font-bold text-sm [font-family:var(--font-button)] hover:bg-[#c9ad00] transition-colors"
                >
                  {t("viewProfile")}
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </BlockReveal>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !hasPosts ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-16 text-center shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ImageIcon size={40} className="!text-white/35" />
            </div>
            <p className="!text-white/70 text-lg font-medium mb-6 max-w-md mx-auto">
              {t("emptyState")}
            </p>
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e6c800] !text-[#343131] font-bold [font-family:var(--font-button)] hover:bg-[#c9ad00] transition-colors"
            >
              {t("viewProfile")}
              <ExternalLink size={18} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <BlockReveal key={post.id} delay={i * 0.06}>
                <motion.a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#e6c800]/30 transition-all duration-300 hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)]"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.caption?.slice(0, 100) ?? t("altPost")}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 text-[10px] font-bold uppercase tracking-wider !text-white/90">
                        {getMediaTypeLabel(post.mediaType, t)}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-flex items-center gap-2 text-[#e6c800] text-sm font-bold">
                        {t("openOnInstagram")}
                        <ExternalLink size={14} />
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    {post.caption && (
                      <p className="!text-white/72 text-[15px] leading-relaxed line-clamp-2 mb-3" title={post.caption}>
                        {post.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs !text-white/45">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(post.timestamp, locale)}
                      </span>
                    </div>
                  </div>
                </motion.a>
              </BlockReveal>
            ))}
          </div>
        )}

        {hasPosts && (
          <div className="mt-12 text-center">
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 !text-white/82 font-bold text-sm [font-family:var(--font-button)] hover:border-[#e6c800]/50 hover:text-[#e6c800] transition-colors"
            >
              {t("visitAccount")}
              <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
