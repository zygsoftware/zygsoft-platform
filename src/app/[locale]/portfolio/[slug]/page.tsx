import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, ExternalLink, Building2, Calendar, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zygsoft.com";

/* ── Gradient palette for image placeholders ────────────────────── */
const GRADIENTS = [
    "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    "linear-gradient(135deg, #0f3460 0%, #533483 100%)",
    "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    "linear-gradient(135deg, #1a1a1a 0%, #e6c800 100%)",
];

function pickGradient(slug: string) {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff;
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default async function PortfolioDetailPage({
    params,
}: {
    params: Promise<{ slug: string; locale: string }>;
}) {
    const { slug, locale } = await params;

    const project = await prisma.project.findUnique({ where: { slug } });

    if (!project) notFound();

    /* ── Related projects (up to 3 others) ── */
    const related = await prisma.project.findMany({
        where:   { slug: { not: slug } },
        orderBy: { createdAt: "desc" },
        take:    3,
        select:  { id: true, title: true, description: true, slug: true, client: true },
    });

    const isEn       = locale === "en";
    const prefix     = isEn ? `${SITE_URL}/en` : SITE_URL;
    const portfolioHref = isEn ? "/en/portfolio" : "/portfolio";

    const createdDate = project.createdAt
        ? new Date(project.createdAt).toLocaleDateString(isEn ? "en-US" : "tr-TR", {
              year: "numeric", month: "long", day: "numeric",
          })
        : null;

    /* ── JSON-LD ── */
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CreativeWork",
                "@id":   `${prefix}/portfolio/${slug}`,
                "name":  project.title,
                "description": project.description,
                "creator": {
                    "@type": "Organization",
                    "@id":   `${SITE_URL}/#organization`,
                    "name":  "ZYGSOFT",
                },
                ...(project.client ? { "accountablePerson": { "@type": "Organization", "name": project.client } } : {}),
                ...(project.link   ? { "url": project.link } : {}),
                ...(project.image  ? { "image": project.image } : {}),
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": isEn ? "Home"      : "Ana Sayfa",  "item": prefix },
                    { "@type": "ListItem", "position": 2, "name": isEn ? "Portfolio" : "Portfolyo",  "item": `${prefix}/portfolio` },
                    { "@type": "ListItem", "position": 3, "name": project.title, "item": `${prefix}/portfolio/${slug}` },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />
            <main style={{ background: "#f9f7f3" }} className="min-h-screen">

                {/* ── Hero ── */}
                <section
                    className="pt-48 pb-28 relative overflow-hidden"
                    style={{ background: "linear-gradient(160deg, #f9f7f3 60%, #f0ece0 100%)" }}
                >
                    {/* Dot grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />

                    <div className="container mx-auto px-6 max-w-7xl relative z-10">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#999] mb-10">
                            <Link href={portfolioHref} className="hover:text-[#0e0e0e] transition-colors">
                                {isEn ? "Portfolio" : "Portfolyo"}
                            </Link>
                            <ChevronRight size={12} />
                            <span className="text-[#0e0e0e] truncate max-w-xs">{project.title}</span>
                        </nav>

                        <span className="section-label">{isEn ? "Case Study" : "Proje Detayı"}</span>

                        <h1
                            className="font-display font-extrabold text-[#0e0e0e] mt-4 mb-6"
                            style={{ fontSize: "clamp(36px, 5vw, 72px)", lineHeight: 1.05 }}
                        >
                            {project.title}
                        </h1>

                        {/* Meta chips */}
                        <div className="flex flex-wrap items-center gap-4 mt-8">
                            {project.client && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-full text-sm font-semibold text-[#555]">
                                    <Building2 size={14} />
                                    {project.client}
                                </span>
                            )}
                            {createdDate && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-full text-sm font-semibold text-[#555]">
                                    <Calendar size={14} />
                                    {createdDate}
                                </span>
                            )}
                            {project.link && (
                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6c800] rounded-full text-sm font-bold text-[#0e0e0e] hover:bg-[#d4b800] transition-colors"
                                >
                                    <ExternalLink size={14} />
                                    {isEn ? "View Project" : "Projeyi Ziyaret Et"}
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Project Image ── */}
                <section className="container mx-auto px-6 max-w-7xl -mt-8 relative z-20 mb-0">
                    <div
                        className="w-full rounded-2xl overflow-hidden border border-black/8 shadow-xl"
                        style={{ aspectRatio: "21/9" }}
                    >
                        {project.image ? (
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: pickGradient(slug) }}
                            >
                                <span
                                    className="font-display font-extrabold text-white/10 select-none"
                                    style={{ fontSize: "clamp(60px, 12vw, 160px)", letterSpacing: "-0.04em" }}
                                >
                                    {project.title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Content ── */}
                <section className="py-24 bg-white border-y border-black/8 mt-16">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                            {/* Main text */}
                            <div className="lg:col-span-8">
                                <h2 className="font-display font-bold text-3xl text-[#0e0e0e] mb-6">
                                    {isEn ? "About This Project" : "Proje Hakkında"}
                                </h2>
                                <p className="text-[#555] text-lg leading-relaxed whitespace-pre-line">
                                    {project.description}
                                </p>

                                {project.link && (
                                    <div className="mt-12 pt-10 border-t border-black/8">
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary inline-flex"
                                        >
                                            {isEn ? "Visit Live Project" : "Canlı Projeyi Gör"}
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#f9f7f3] border border-black/8 rounded-xl p-8 sticky top-32 space-y-6">
                                    <h3 className="font-display font-bold text-lg text-[#0e0e0e]">
                                        {isEn ? "Project Details" : "Proje Bilgileri"}
                                    </h3>

                                    {project.client && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
                                                {isEn ? "Client" : "Müşteri"}
                                            </p>
                                            <p className="text-[#0e0e0e] font-semibold">{project.client}</p>
                                        </div>
                                    )}

                                    {createdDate && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
                                                {isEn ? "Date" : "Tarih"}
                                            </p>
                                            <p className="text-[#0e0e0e] font-semibold">{createdDate}</p>
                                        </div>
                                    )}

                                    {project.link && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
                                                {isEn ? "Live URL" : "Proje Linki"}
                                            </p>
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#e6c800] font-semibold text-sm hover:underline break-all inline-flex items-center gap-1"
                                            >
                                                {project.link.replace(/^https?:\/\//, "")}
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-black/8">
                                        <p className="text-sm text-[#888] leading-relaxed">
                                            {isEn
                                                ? "Interested in a similar project? We'd love to hear about it."
                                                : "Benzer bir projeniz mi var? Bize yazın, görüşelim."}
                                        </p>
                                        <Link
                                            href={isEn ? "/en/contact" : "/contact"}
                                            className="btn-yellow inline-flex mt-4 w-full justify-center"
                                        >
                                            {isEn ? "Get a Free Quote" : "Ücretsiz Teklif Alın"}
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Related Projects ── */}
                {related.length > 0 && (
                    <section className="py-24" style={{ background: "#f9f7f3" }}>
                        <div className="container mx-auto px-6 max-w-7xl">
                            <h2 className="font-display font-bold text-3xl text-[#0e0e0e] mb-10">
                                {isEn ? "Other Projects" : "Diğer Projeler"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {related.map((rel) => (
                                    <Link
                                        key={rel.id}
                                        href={`${isEn ? "/en" : ""}/portfolio/${rel.slug}`}
                                        className="group block bg-white border border-black/8 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {/* Mini image placeholder */}
                                        <div
                                            className="aspect-[16/9] w-full"
                                            style={{ background: pickGradient(rel.slug) }}
                                        />
                                        <div className="p-5">
                                            {rel.client && (
                                                <p className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
                                                    {rel.client}
                                                </p>
                                            )}
                                            <h3 className="font-display font-bold text-lg text-[#0e0e0e] group-hover:text-[#c9ad00] transition-colors mb-2">
                                                {rel.title}
                                            </h3>
                                            <p className="text-sm text-[#666] line-clamp-2">{rel.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Bottom CTA ── */}
                <section className="py-20" style={{ background: "#0e0e0e" }}>
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2
                                    className="font-display font-extrabold text-white mb-3"
                                    style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
                                >
                                    {isEn ? "Let's Build Something Together" : "Sizin Projenizi De Konuşalım"}
                                </h2>
                                <p className="text-white/50 text-lg">
                                    {isEn
                                        ? "Ready to start your next digital project?"
                                        : "Dijital dönüşümünüze birlikte başlayalım."}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <Link
                                    href={portfolioHref}
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-bold rounded-xl hover:border-white/50 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    {isEn ? "All Projects" : "Tüm Projeler"}
                                </Link>
                                <Link
                                    href={isEn ? "/en/contact" : "/contact"}
                                    className="btn-yellow inline-flex"
                                >
                                    {isEn ? "Contact Us" : "İletişime Geç"}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
