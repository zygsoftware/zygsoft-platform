"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    Box,
    FileText,
    Layers,
    FileImage,
    BrainCircuit,
    Gem,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";

const tools = [
    {
        title: "Hukuk UDF Dönüştürücü",
        desc: "Word (DOC/DOCX) dosyalarınızı saniyeler içinde UYAP uyumlu UDF formatına dönüştürün.",
        icon: <FileText size={24} />,
        href: "/dashboard/tools/doc-to-udf",
        slug: "legal-toolkit"
    },
    {
        title: "PDF Birleştirici",
        desc: "Birden fazla PDF dökümanını tek bir dosya altında birleştirin.",
        icon: <Layers size={24} />,
        href: "/dashboard/tools/pdf-merge",
        slug: "legal-toolkit"
    },
    {
        title: "TIFF / JPG to PDF",
        desc: "Resim formatındaki dosyalarınızı tek tıkla PDF kitapçığına çevirin.",
        icon: <FileImage size={24} />,
        href: "/dashboard/tools/image-to-pdf",
        slug: "legal-toolkit"
    },
    {
        title: "AI Karar Özeti",
        desc: "Dava dosyalarını yapay zeka ile analiz edin ve özetleyin.",
        icon: <BrainCircuit size={24} />,
        href: "/dashboard/tools/ai-summary",
        slug: "legal-toolkit"
    }
];

export default function ProductsPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const activeProductSlugs = user?.activeProductSlugs || [];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">Ürünlerim</h1>
                <p className="text-slate-500 font-medium font-sans">Hukuk Araçları Paketi ve abonelikleriniz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, idx) => {
                    const isLocked = !activeProductSlugs.includes(tool.slug);
                    return (
                        <div key={idx} className="relative group">
                            <TiltCard maxTilt={5} className="h-full">
                            <Link
                                href={isLocked ? "/abonelikler" : tool.href}
                                className={`block h-full bg-white p-8 rounded-[2rem] border transition-all duration-300 hover-lift ${isLocked
                                    ? "border-[#0a0c10]/[0.06] hover:border-[#e6c800]/40 hover:shadow-xl shadow-sm"
                                    : "border-[#0a0c10]/[0.06] hover:shadow-xl hover:-translate-y-1 shadow-sm"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isLocked ? "bg-[#fafafc] text-[#0a0c10]/40 border border-[#0a0c10]/10" : "bg-[#0a0c10] text-[#e6c800]"
                                    }`}>
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-display font-black text-[#0a0c10] mb-3">{tool.title}</h3>
                                <p className="text-[#0a0c10]/60 text-sm font-medium leading-relaxed mb-6">{tool.desc}</p>

                                {!isLocked ? (
                                    <div className="inline-flex items-center gap-2 text-slate-950 text-sm font-black group-hover:text-[#e6c800] transition-colors">
                                        ARACI AÇ <Box size={16} />
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 text-[#e6c800] text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                                        ABONELİK GEREKLİ <ArrowRight size={14} />
                                    </div>
                                )}
                            </Link>
                            </TiltCard>

                            {isLocked && (
                                <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#e6c800]/10 flex items-center justify-center border border-[#e6c800]/20">
                                    <Gem size={18} className="text-[#e6c800]" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!activeProductSlugs.length && (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-[#0a0c10]/[0.08]">
                    <div className="w-20 h-20 bg-[#fafafc] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#0a0c10]/5">
                        <Box size={32} className="text-[#0a0c10]/30" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-[#0a0c10] mb-4">Henüz Hukuk Araçları Paketi aboneliğiniz yok mu?</h2>
                    <p className="text-[#0a0c10]/60 font-medium mb-8 max-w-md mx-auto">
                        Tüm belge araçlarına erişmek için Hukuk Araçları Paketi'ne abone olun. Tek yıllık ödeme, tüm araçlar dahil.
                    </p>
                    <Link href="/abonelikler" className="inline-flex items-center gap-2 bg-[#e6c800] text-[#0a0c10] px-10 py-4 rounded-2xl text-sm font-black hover:bg-[#c9ad00] transition-all shadow-xl shadow-[#e6c800]/20">
                        PAKETİ İNCELE <ArrowRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
}
