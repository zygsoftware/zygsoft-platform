"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import { BlockReveal } from "@/components/ui/reveal";

export type LegalRelatedLink = { href: "/privacy" | "/terms" | "/kvkk"; label: string };

type LegalSection = { title: string; body: string };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tocTitle: string;
  updatedLabel: string;
  icon: LucideIcon;
  sections: readonly LegalSection[];
  relatedLinks: LegalRelatedLink[];
};

const dotGrid = {
  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
} as const;

export function LegalPageShell({
  eyebrow,
  title,
  subtitle,
  tocTitle,
  updatedLabel,
  icon: Icon,
  sections,
  relatedLinks,
}: Props) {
  return (
    <>
      <Header />
      <main className="text-[#1a1a1a]" style={{ background: "#f9f7f3" }}>
        {/* Hero — matches Contact / About */}
        <section
          className="relative overflow-hidden pt-40 pb-20 md:pb-24"
          style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0" style={dotGrid} />
          <motion.div
            className="pointer-events-none absolute right-16 top-24 h-72 w-72 rounded-full md:right-24"
            animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(circle, rgba(230,200,0,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
              className="max-w-3xl"
            >
              <span className="section-label">{eyebrow}</span>
              <div className="mb-8 mt-2 flex items-start gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-[#e6c800]/25 bg-[#0e0e0e] text-[#e6c800] shadow-[0_4px_24px_rgba(230,200,0,0.18)]"
                  aria-hidden
                >
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <div>
                  <h1
                    className="font-display font-extrabold text-[#0e0e0e]"
                    style={{ fontSize: "clamp(32px,4.5vw,56px)", lineHeight: 1.05 }}
                  >
                    {title}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-[#888]">{updatedLabel}</p>
                </div>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-[#666]">{subtitle}</p>

              {relatedLinks.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {relatedLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0e0e0e] shadow-sm backdrop-blur-sm transition-all hover:border-[#e6c800]/40 hover:bg-white hover:shadow-md"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Body */}
        <section className="border-y border-black/[0.08] bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* TOC — sticky sidebar */}
              <aside className="lg:col-span-4 text-[#1a1a1a]">
                <div className="lg:sticky lg:top-28">
                  <p className="section-label mb-4 !text-[#52525b]">{tocTitle}</p>
                  <nav
                    className="rounded-xl border border-black/[0.08] bg-white p-4 shadow-sm hover-glow [&_a]:no-underline"
                    aria-label={tocTitle}
                  >
                    <ul className="space-y-0.5 text-[#1a1a1a]">
                      {sections.map((s, i) => {
                        const short =
                          s.title.includes(".") ? s.title.split(".").slice(1).join(".").trim() : s.title;
                        return (
                          <li key={s.title}>
                            <a
                              href={`#legal-section-${i}`}
                              className="group flex gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333333] transition-colors hover:bg-black/[0.05] hover:text-[#0e0e0e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c800]"
                            >
                              <span className="shrink-0 font-mono text-xs font-bold text-[#c9ad00] tabular-nums group-hover:text-[#0e0e0e]">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="leading-snug text-[#333333] group-hover:text-[#0e0e0e]">
                                {short}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              </aside>

              {/* Sections */}
              <div className="space-y-6 lg:col-span-8">
                {sections.map((section, i) => (
                  <BlockReveal key={section.title}>
                    <article
                      id={`legal-section-${i}`}
                      className="scroll-mt-28 rounded-xl border border-black/[0.06] bg-[#faf9f6] p-6 shadow-sm md:p-8"
                    >
                      <h2 className="mb-4 flex flex-wrap items-baseline gap-2 font-display text-xl font-bold text-[#0e0e0e] md:text-2xl">
                        <span className="text-[#e6c800]">{section.title.split(".")[0]}.</span>
                        <span>
                          {section.title.includes(".")
                            ? section.title.split(".").slice(1).join(".").trim()
                            : ""}
                        </span>
                      </h2>
                      <div className="whitespace-pre-line text-sm leading-[1.75] text-[#555] md:text-[15px]">
                        {section.body}
                      </div>
                    </article>
                  </BlockReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
