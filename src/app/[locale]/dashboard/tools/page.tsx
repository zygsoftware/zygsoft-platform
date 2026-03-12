"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { hasToolAccess } from "@/lib/trial-access-client";
import {
    FileText,
    FileImage,
    Layers,
    ArrowRight,
    CheckCircle2,
    Lock,
    Sparkles,
    HeadphonesIcon,
    ShoppingCart,
    Scale,
    FileStack,
    Zap,
    Star,
    ChevronRight,
    Scissors,
    Image as ImageIcon,
} from "lucide-react";

/* ── Tool definitions ────────────────────────────────────────────── */

type AccessLevel = "active" | "subscription_required" | "login_only_active";

interface ToolDef {
    id:          string;
    name:        string;
    description: string;
    longDesc:    string;
    icon:        React.ReactNode;
    iconBg:      string;
    iconColor:   string;
    href:        string;
    group:       "document" | "automation";
    featured:    boolean;
    /** Slugs that unlock this tool. Empty = available to any logged-in user. */
    requiredSlugs: string[];
}

const LEGAL_TOOLKIT_SLUG = "legal-toolkit";

const TOOLS: ToolDef[] = [
    {
        id:          "doc-to-udf",
        name:        "DOCX → UDF Dönüştürücü",
        description: "Word belgelerini UYAP uyumlu UDF formatına saniyeler içinde dönüştürün.",
        longDesc:    "Avukatlık bürolarının en çok ihtiyaç duyduğu araç. DOCX dosyalarınızı doğrudan UYAP sistemine yüklenebilir UDF formatına dönüştürür. KVKK uyumlu, toplu işlem destekli.",
        icon:        <FileText size={24} />,
        iconBg:      "bg-[#0e0e0e]",
        iconColor:   "text-[#e6c800]",
        href:        "/dashboard/tools/doc-to-udf",
        group:       "document",
        featured:    true,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "image-to-pdf",
        name:        "Görsel → PDF Dönüştürücü",
        description: "JPG, JPEG veya PNG görsellerinizi tek bir profesyonel PDF'e dönüştürün.",
        longDesc:    "Birden fazla görsel dosyasını yükleyin — tek tıkla sıralı, düzenli bir PDF dökümanına birleştirin. Sürükle-bırak desteği.",
        icon:        <FileImage size={24} />,
        iconBg:      "bg-blue-50",
        iconColor:   "text-blue-600",
        href:        "/dashboard/tools/image-to-pdf",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "pdf-merge",
        name:        "PDF Birleştirici",
        description: "Birden fazla PDF dosyasını tek bir çıktı halinde birleştirin.",
        longDesc:    "PDF dosyalarını sürükle-bırak ile sıralayın, istediğiniz düzende birleştirin. Dosya sayısı ve yeniden sıralama desteği mevcuttur.",
        icon:        <Layers size={24} />,
        iconBg:      "bg-violet-50",
        iconColor:   "text-violet-600",
        href:        "/dashboard/tools/pdf-merge",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "pdf-split",
        name:        "PDF Bölme",
        description: "PDF dosyanızdan belirli sayfaları seçerek yeni bir PDF oluşturun.",
        longDesc:    "Tek bir PDF yükleyin, sayfa aralığı girin — 1-5, 7, 10-12 gibi. Virgül veya tire ile sayfa seçimi yapın.",
        icon:        <Scissors size={24} />,
        iconBg:      "bg-amber-50",
        iconColor:   "text-amber-600",
        href:        "/dashboard/tools/pdf-split",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "pdf-to-image",
        name:        "PDF → Görsel",
        description: "PDF sayfalarınızı PNG veya JPG görsellere dönüştürün.",
        longDesc:    "PDF yükleyin, çıktı formatını (PNG/JPG) seçin. İsteğe bağlı sayfa aralığı ile belirli sayfaları dönüştürün.",
        icon:        <ImageIcon size={24} />,
        iconBg:      "bg-rose-50",
        iconColor:   "text-rose-600",
        href:        "/dashboard/tools/pdf-to-image",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "tiff-to-pdf",
        name:        "TIFF → PDF",
        description: "TIFF/TIF dosyalarınızı tek bir PDF'e dönüştürün.",
        longDesc:    "Birden fazla TIFF dosyası yükleyin. Çok sayfalı TIFF'ler desteklenir. Sıralamayı sürükle-bırak ile değiştirebilirsiniz.",
        icon:        <FileText size={24} />,
        iconBg:      "bg-teal-50",
        iconColor:   "text-teal-600",
        href:        "/dashboard/tools/tiff-to-pdf",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "ocr-text",
        name:        "OCR Metin Çıkarma",
        description: "PDF ve görsellerden metin çıkarın. Türkçe ve İngilizce destekli.",
        longDesc:    "PDF, PNG, JPG, TIFF dosyalarınızı yükleyin. Dil seçin (TR/EN) ve metni çıkarın. Kopyala veya TXT olarak indirin.",
        icon:        <FileText size={24} />,
        iconBg:      "bg-indigo-50",
        iconColor:   "text-indigo-600",
        href:        "/dashboard/tools/ocr-text",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
    {
        id:          "batch-convert",
        name:        "Toplu Belge Dönüştürücü",
        description: "Birden fazla belgeyi tek seferde dönüştürün. ZIP olarak indirin.",
        longDesc:    "DOCX→UDF, Görsel→PDF, TIFF→PDF veya OCR seçin. En fazla 20 dosya yükleyin, tek ZIP ile indirin.",
        icon:        <Layers size={24} />,
        iconBg:      "bg-sky-50",
        iconColor:   "text-sky-600",
        href:        "/dashboard/tools/batch-convert",
        group:       "document",
        featured:    false,
        requiredSlugs: [LEGAL_TOOLKIT_SLUG],
    },
];

/* ── Access state helpers ────────────────────────────────────────── */

function resolveAccess(
    tool:               ToolDef,
    activeProductSlugs: string[],
    isAdmin:            boolean,
    user: any,
): AccessLevel {
    if (tool.requiredSlugs.length === 0) return "login_only_active";
    if (isAdmin) return "active";
    const hasAccess = tool.requiredSlugs.some((s) => activeProductSlugs.includes(s));
    if (hasAccess) return "active";
    if (hasToolAccess(user)) return "active";
    return "subscription_required";
}

const ACCESS_CFG = {
    active: {
        badge:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
        label:   "Aktif",
        icon:    <CheckCircle2 size={12} />,
    },
    login_only_active: {
        badge:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
        label:   "Aktif",
        icon:    <CheckCircle2 size={12} />,
    },
    subscription_required: {
        badge:   "bg-amber-50 text-amber-700 border border-amber-200",
        label:   "Abonelik Gerekli",
        icon:    <Lock size={12} />,
    },
} as const;

/* ── Tool card ───────────────────────────────────────────────────── */

function ToolCard({
    tool,
    access,
}: {
    tool:   ToolDef;
    access: AccessLevel;
}) {
    const t        = useTranslations("Dashboard.overview.tools");
    const cfg      = ACCESS_CFG[access];
    const isLocked = access === "subscription_required";
    const name     = tool.id === "tiff-to-pdf" ? t("tiffToPdf.hubName") : tool.id === "ocr-text" ? t("ocrText.hubName") : tool.id === "batch-convert" ? t("batchConvert.hubName") : tool.name;
    const desc     = tool.id === "tiff-to-pdf" ? t("tiffToPdf.hubDescription") : tool.id === "ocr-text" ? t("ocrText.hubDescription") : tool.id === "batch-convert" ? t("batchConvert.hubDescription") : tool.description;

    return (
        <div
                className={`
                relative bg-white rounded-3xl border overflow-hidden
                flex flex-col h-full
                transition-all duration-200
                hover:shadow-md
                ${isLocked ? "border-slate-200" : "border-slate-200 hover:border-slate-300"}
            `}
        >
            {/* Featured ribbon */}
            {tool.featured && (
                <div className="absolute top-0 right-0 flex items-center gap-1 bg-[#e6c800] text-[#0e0e0e] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-xl">
                    <Star size={10} fill="currentColor" />
                    Önerilen
                </div>
            )}

            <div className="p-7 flex flex-col flex-1 gap-5">
                {/* Icon + badge row */}
                <div className="flex items-start justify-between gap-3">
                    <div
                        className={`
                            w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                            ${isLocked ? "bg-slate-100 text-slate-400" : tool.iconBg + " " + tool.iconColor}
                        `}
                    >
                        {tool.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            {t("packageBadge")}
                        </span>
                        <span
                            className={`
                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0
                                ${cfg.badge}
                            `}
                        >
                            {cfg.icon}
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                    <h3 className="font-heading font-black text-slate-950 text-lg mb-2 leading-tight">
                        {name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {desc}
                    </p>
                </div>

                {/* CTA */}
                {isLocked ? (
                    <Link
                        href="/dijital-urunler/hukuk-araclari-paketi"
                        className="
                            inline-flex items-center justify-center gap-2 w-full
                            px-4 py-3 rounded-xl
                            bg-[#e6c800] text-slate-950 text-sm font-black
                            hover:bg-[#d4b800] transition-colors
                        "
                    >
                        <ShoppingCart size={15} />
                        Paketi İncele
                        <ArrowRight size={14} />
                    </Link>
                ) : (
                    <Link
                        href={tool.href}
                        className="
                            inline-flex items-center justify-center gap-2 w-full
                            px-4 py-3 rounded-xl
                            bg-slate-950 text-white text-sm font-black
                            hover:bg-slate-700 transition-colors
                        "
                    >
                        <Zap size={15} />
                        Aracı Kullan
                        <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}

/* ── Featured (large) card ───────────────────────────────────────── */

function FeaturedToolCard({
    tool,
    access,
}: {
    tool:   ToolDef;
    access: AccessLevel;
}) {
    const isLocked = access === "subscription_required";

    return (
        <div
            className="
                relative overflow-hidden rounded-3xl
                bg-[#0e0e0e] text-white
                border border-white/10
                p-8 md:p-10
            "
        >
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Left: content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Scale size={22} />
                        </div>

                        {/* Flagship badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider">
                            <Star size={10} fill="currentColor" />
                            Amiral Ürün
                        </span>

                        {/* Access badge */}
                        {!isLocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold">
                                <CheckCircle2 size={11} />
                                Abonelik Aktif
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs font-bold">
                                <Lock size={11} />
                                Abonelik Gerekli
                            </span>
                        )}
                    </div>

                    <h2 className="font-heading font-black text-2xl text-white mb-2">
                        {tool.name}
                    </h2>
                    <p className="text-white/60 font-medium leading-relaxed max-w-xl">
                        {tool.longDesc}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {["DOCX → UDF", "KVKK Uyumlu", "Toplu İşlem", "UYAP Uyumlu"].map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 rounded-md bg-white/8 text-white/50 text-xs font-semibold border border-white/10"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right: CTA */}
                <div className="shrink-0 flex flex-col gap-3 w-full lg:w-auto lg:min-w-[200px]">
                    {isLocked ? (
                        <>
                            <Link
                                href="/dijital-urunler/hukuk-araclari-paketi"
                                className="
                                    inline-flex items-center justify-center gap-2
                                    px-6 py-3.5 rounded-xl
                                    bg-[#e6c800] text-[#0e0e0e] font-black text-sm
                                    hover:bg-[#d4b800] transition-colors
                                    whitespace-nowrap
                                "
                            >
                                <ShoppingCart size={16} />
                                Paketi İncele
                            </Link>
                            <p className="text-white/40 text-xs text-center font-medium">
                                3000 TL / yıl · Tüm belge araçları dahil
                            </p>
                        </>
                    ) : (
                        <>
                            <Link
                                href={tool.href}
                                className="
                                    inline-flex items-center justify-center gap-2
                                    px-6 py-3.5 rounded-xl
                                    bg-[#e6c800] text-[#0e0e0e] font-black text-sm
                                    hover:bg-[#d4b800] transition-colors
                                    whitespace-nowrap
                                "
                            >
                                <Zap size={16} />
                                Aracı Kullan
                            </Link>
                            <Link
                                href="/dashboard/billing"
                                className="text-white/40 text-xs text-center font-medium hover:text-white/60 transition-colors"
                            >
                                Abonelik bilgileri →
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function ToolsHubPage() {
    const { data: session } = useSession();
    const t = useTranslations("Dashboard.overview.tools");
    const locale = useLocale();
    const user              = session?.user as any;
    const activeProductSlugs: string[] = user?.activeProductSlugs ?? [];
    const isAdmin           = user?.role === "admin";

    const featuredTool   = TOOLS.find((tool) => tool.featured)!;
    const featuredAccess = resolveAccess(featuredTool, activeProductSlugs, isAdmin, user);

    const documentTools   = TOOLS.filter((tool) => tool.group === "document");

    const showLockedStrip = featuredAccess === "subscription_required";
    const showReadyStrip  = featuredAccess === "active" || featuredAccess === "login_only_active";

    return (
        <div className="space-y-10">

            {/* ── Onboarding strip ── */}
            {showLockedStrip && (
                <Link
                    href={locale === "en" ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi"}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100/80 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Lock size={18} />
                        </div>
                        <p className="text-sm font-bold text-slate-950">
                            {t("onboardingLocked")}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-amber-700 font-black text-xs group-hover:gap-2 transition-all">
                        {t("onboardingLockedCta")}
                        <ChevronRight size={14} />
                    </span>
                </Link>
            )}
            {showReadyStrip && (
                <Link
                    href={featuredTool.href}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 size={18} />
                        </div>
                        <p className="text-sm font-bold text-slate-950">
                            {t("onboardingReady")}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs group-hover:gap-2 transition-all">
                        {t("onboardingReadyCta")}
                        <ChevronRight size={14} />
                    </span>
                </Link>
            )}

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">
                        {t("hubTitle")}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {t("hubSubtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Sparkles size={14} className="text-amber-500" />
                    {activeProductSlugs.length > 0 || hasToolAccess(user)
                        ? t("toolsActiveCount", { count: TOOLS.filter((tool) => resolveAccess(tool, activeProductSlugs, isAdmin, user) !== "subscription_required").length })
                        : t("toolsExploreHint")}
                </div>
            </div>

            {/* ── Document Tools ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileStack size={16} className="text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("groupDocument")}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {t("groupDocumentDesc")}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {documentTools.map((tool) => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            access={resolveAccess(tool, activeProductSlugs, isAdmin, user)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Automation Tools (placeholder) ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Zap size={16} className="text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("groupAutomation")}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {t("groupAutomationDesc")}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Zap size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm mb-1">
                        {t("groupAutomation")}
                    </p>
                    <p className="text-slate-300 text-xs font-medium">
                        {t("automationPlaceholder")}
                    </p>
                </div>
            </div>

            {/* ── Help strip ── */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                        <HeadphonesIcon size={18} />
                    </div>
                    <div>
                        <p className="font-heading font-black text-slate-950 text-sm">
                            Bir sorun mu var?
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Destek ekibimiz size yardımcı olmaya hazır.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/support"
                        className="
                            inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                            bg-slate-950 text-white text-xs font-black
                            hover:bg-slate-700 transition-colors
                        "
                    >
                        Destek Talebi Aç
                        <ArrowRight size={13} />
                    </Link>
                    <Link
                        href="/contact"
                        className="
                            inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                            bg-white text-slate-600 border border-slate-200 text-xs font-bold
                            hover:bg-slate-50 transition-colors
                        "
                    >
                        Bize Yazın
                    </Link>
                </div>
            </div>

        </div>
    );
}
