"use client";

import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    FileImage,
    FileText,
    Globe2,
    Layers,
    Minimize2,
    ScanText,
    Scissors,
    Sparkles,
    ShieldCheck,
    Workflow,
    Zap,
} from "lucide-react";
import { PublicToolsShell } from "@/components/tools/PublicToolsShell";
import { PaymentModalTrigger } from "@/components/payment/PaymentModalTrigger";
import { hasToolAccess } from "@/lib/trial-access-client";

const TOOL_ITEMS = [
    {
        title: "DOCX → UDF Dönüştürücü",
        desc: "Word belgelerini UYAP uyumlu UDF formatına dönüştürün.",
        href: "/document-tools/doc-to-udf",
        icon: FileText,
    },
    {
        title: "PDF Birleştirme",
        desc: "Birden fazla PDF dosyasını tek çıktı halinde birleştirin.",
        href: "/document-tools/pdf-merge",
        icon: Layers,
    },
    {
        title: "PDF Bölme",
        desc: "PDF dosyalarını sayfa aralığına göre ayırın veya parçalara bölün.",
        href: "/document-tools/pdf-split",
        icon: Scissors,
    },
    {
        title: "PDF → Görsel",
        desc: "PDF sayfalarını PNG veya JPG formatına çıkarın.",
        href: "/document-tools/pdf-to-image",
        icon: FileImage,
    },
    {
        title: "OCR Metin Çıkarma",
        desc: "Taranmış PDF ve görsellerden metin alın.",
        href: "/document-tools/ocr-text",
        icon: ScanText,
    },
    {
        title: "PDF Sıkıştırma",
        desc: "Dosya boyutunu paylaşım ve yükleme için küçültün.",
        href: "/document-tools/pdf-compress",
        icon: Minimize2,
    },
];

export default function PublicDocumentToolsHubPage() {
    const { data: session } = useSession();
    const hasAccess = session?.user && hasToolAccess(session.user as Parameters<typeof hasToolAccess>[0]);

    return (
        <PublicToolsShell>
            <div className="space-y-12">
                <section className="relative overflow-hidden rounded-[1.75rem] border border-[#343131]/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(249,247,241,0.92))] px-5 py-5 shadow-[0_14px_40px_rgba(17,24,39,0.045)] sm:px-7 lg:px-8">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] bg-[radial-gradient(circle_at_top_right,rgba(230,200,0,0.12),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(15,19,36,0.04),transparent_58%)]" />
                    <div className="pointer-events-none absolute left-8 top-7 h-px w-16 bg-gradient-to-r from-[#e6c800]/55 to-transparent" />

                    <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
                        <div className="max-w-3xl">
                            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#343131]/10 bg-white/72 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/72 backdrop-blur">
                                <Sparkles size={12} />
                                Hukuk Araçları Paketi
                            </p>
                            <h1 className="max-w-2xl text-[clamp(2.4rem,4.8vw,4rem)] font-black tracking-tight text-[#343131] leading-[0.98]">
                                UYAP ve belge operasyonu için net, hızlı bir ürün merkezi.
                            </h1>
                            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#343131]/62">
                                DOCX → UDF, OCR, PDF düzenleme ve belge dönüştürme akışlarını tek bir ürün altında topluyoruz.
                                Bu alan panel değil; doğrudan karar vermek, satın almak ve araca geçmek için tasarlanmış ürün sahnesi.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                {[
                                    "11 belge aracı",
                                    "UYAP odaklı altyapı",
                                    "OCR ve PDF iş akışları",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-[#343131]/8 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#343131]/66"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="rounded-[1.35rem] border border-[#343131]/8 bg-white/86 p-4 shadow-[0_12px_28px_rgba(17,24,39,0.045)] backdrop-blur-lg">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#343131]/42">
                                        Erişim
                                    </span>
                                    {hasAccess ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                                            <CheckCircle2 size={13} />
                                            Paket aktif
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">
                                            Satın alma gerekli
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-[14px] leading-7 text-[#343131]/58">
                                    Tek yıllık lisansla tüm araçlara erişilir. Hesabınız aktifse hemen kullanabilirsiniz.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2.5">
                                    {hasAccess ? (
                                        <Link
                                            href="/document-tools/doc-to-udf"
                                            className="inline-flex items-center gap-2 rounded-full bg-[#0e1325] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#1a2140]"
                                        >
                                            Aracı Aç
                                            <ArrowRight size={14} />
                                        </Link>
                                    ) : (
                                        <PaymentModalTrigger
                                            productId="legal-toolkit"
                                            className="font-button-force inline-flex items-center gap-2 rounded-full bg-[#e6c800] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#343131] transition-all hover:-translate-y-0.5 hover:bg-[#d2ba00]"
                                        >
                                            Şimdi Satın Al
                                            <ArrowRight size={14} />
                                        </PaymentModalTrigger>
                                    )}
                                    <Link
                                        href="/dijital-urunler"
                                        className="inline-flex items-center gap-2 rounded-full border border-[#343131]/12 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#343131] transition-all hover:-translate-y-0.5 hover:border-[#343131]/20 hover:bg-[#faf9f4]"
                                    >
                                        Ürün Kataloğu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-5 flex flex-wrap gap-2.5 border-t border-[#343131]/8 pt-4">
                        {[
                            { label: "İşlem tipi", value: "Public araç deneyimi" },
                            { label: "Teslim modeli", value: "Hesaba tanımlı erişim" },
                            { label: "Kullanım", value: "Belge operasyonu + OCR" },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="inline-flex items-center gap-2.5 rounded-full border border-[#343131]/8 bg-white/62 px-3.5 py-2 text-[11px] text-[#343131]/78"
                            >
                                <span className="font-black uppercase tracking-[0.16em] text-[#343131]/42">{item.label}</span>
                                <span className="font-bold text-[#343131]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {TOOL_ITEMS.map((tool, index) => {
                        const Icon = tool.icon;
                        return (
                            <motion.div
                                key={tool.href}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: index * 0.04 }}
                                className="group relative overflow-hidden rounded-[1.9rem] border border-white/75 bg-white/94 p-6 shadow-[0_18px_48px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(17,24,39,0.10)]"
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e6c800]/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f7f2] text-[#343131] transition-transform duration-300 group-hover:scale-110">
                                        <Icon size={22} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/35">
                                        Hukuk Araçları Paketi
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-[#343131]">
                                    {tool.title}
                                </h2>
                                <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-[#343131]/62">
                                    {tool.desc}
                                </p>
                                <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#343131]/8 pt-5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#343131]/34">
                                        Dönüşüm aracı
                                    </span>
                                    <Link
                                        href={tool.href}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#0e1325] px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white transition-all group-hover:bg-[#161d36] hover:-translate-y-0.5"
                                    >
                                        Aracı Kullan
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative overflow-hidden rounded-[1.9rem] border border-white/75 bg-white/92 p-7 shadow-[0_18px_50px_rgba(17,24,39,0.06)]">
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_right_center,rgba(230,200,0,0.12),transparent_60%)]" />
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f7f2] text-[#343131]">
                                <Workflow size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#343131]/40">Ürün Mantığı</p>
                                <h3 className="text-xl font-black text-[#343131]">Tek araç değil, tek iş akışı ürünü</h3>
                            </div>
                        </div>
                        <p className="max-w-2xl text-[15px] leading-8 text-[#343131]/66">
                            Bu paket; belge hazırlama, UDF dönüşümü, OCR, PDF düzenleme ve çıktı üretimini aynı merkezde toplar.
                            Yani kullanıcı ayrı ayrı araç aramak yerine aynı ürün altında ihtiyacı olan iş akışını kullanır.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Güvenli işleme",
                                desc: "Belgeler dönüşüm sonrası otomatik temizlenir.",
                            },
                            {
                                icon: Zap,
                                title: "Hızlı kullanım",
                                desc: "Tek ürün altında tüm araçlara doğrudan geçiş yapın.",
                            },
                            {
                                icon: Globe2,
                                title: "Public erişim",
                                desc: "Araçları panel içinde kaybolmadan doğrudan açın.",
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_14px_34px_rgba(17,24,39,0.05)]"
                                >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1324] text-[#e6c800]">
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight text-[#343131]">{item.title}</h3>
                                    <p className="mt-2 text-[14px] leading-7 text-[#343131]/62">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </PublicToolsShell>
    );
}
