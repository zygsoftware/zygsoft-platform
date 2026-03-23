"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createRevealUp, revealViewport, staggerContainer } from "@/components/ui/motion";

type Project = {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  cover_image: string | null;
  category: { name_tr: string; name_en: string } | null;
  featured: boolean;
};

export function PortfolioPreview() {
  const t = useTranslations("Homepage.portfolioPreview");
  const locale = useLocale();
  const reducedMotion = !!useReducedMotion();
  const isTr = locale === "tr";
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects?limit=6")
      .then((res) => res.json())
      .then((data) => {
        const list = data.projects ?? [];
        const featured = list.filter((p: Project) => p.featured);
        setProjects(featured.length >= 3 ? featured : list.slice(0, 3));
      })
      .catch(() => setProjects([]));
  }, []);

  const displayProjects = projects.slice(0, 3);

  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(230,200,0,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
        >
          <motion.div variants={createRevealUp(reducedMotion, 24, 6)}>
            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#343131]/45 mb-5 block">
              {t("tag")}
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.94] tracking-tighter text-[#343131]">
              {t("title").replace(/<br\s*\/?>/gi, " ")}
            </h2>
          </motion.div>
          <motion.div variants={createRevealUp(reducedMotion, 20, 4)}>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-3 font-black text-sm uppercase tracking-[0.2em] text-[#343131] hover:text-[#e6c800] transition-colors"
            >
              {t("exploreMore")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {displayProjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
          >
            {displayProjects.map((project, i) => {
              const title = isTr ? project.title_tr : project.title_en;
              const excerpt = isTr ? project.excerpt_tr : project.excerpt_en;
              const categoryName = project.category ? (isTr ? project.category.name_tr : project.category.name_en) : null;
              const href = locale === "tr" ? `/portfolio/${project.slug}` : `/${locale}/portfolio/${project.slug}`;

              return (
                <motion.div key={project.id} variants={createRevealUp(reducedMotion, 32, 8)}>
                  <Link href={href} className="block group">
                    <motion.article
                      className="relative overflow-hidden rounded-2xl border border-[#343131]/[0.06] bg-[#fafafc] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_56px_rgba(0,0,0,0.1)] hover:border-[#e6c800]/20 transition-all duration-300"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="aspect-[4/3] relative bg-[#343131]/[0.04] overflow-hidden">
                        {project.cover_image ? (
                          <Image
                            src={project.cover_image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#343131]/15">
                            <span className="text-4xl font-black">{i + 1}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {categoryName && (
                          <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-white/95 text-[10px] font-bold uppercase text-[#343131]">
                            {categoryName}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl text-[#343131] mb-2 group-hover:text-[#e6c800] transition-colors line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-[#343131]/55 text-sm leading-relaxed line-clamp-2 mb-4">
                          {excerpt}
                        </p>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#343131]/70 group-hover:text-[#e6c800] transition-colors">
                          {t("viewProject")}
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            variants={createRevealUp(reducedMotion, 24, 6)}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            className="rounded-2xl border border-[#343131]/[0.06] bg-[#fafafc] p-16 text-center"
          >
            <p className="text-[#343131]/55 font-medium mb-6">
              {isTr ? "Projeler yükleniyor..." : "Loading projects..."}
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 font-bold text-[#e6c800] hover:text-[#343131] transition-colors"
            >
              {t("exploreMore")}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
