"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    Box,
    FileText,
    Layers,
    FileImage,
    ShieldAlert,
    ScanText,
    BrainCircuit,
    FileSignature,
    Gem
} from "lucide-react";
import Link from "next/link";

const tools = [
    {
        title: "Hukuk UDF Dönüştürücü",
        desc: "Word (DOC/DOCX) dosyalarınızı saniyeler içinde UYAP uyumlu UDF formatına dönüştürün.",
        icon: <FileText size={24} />,
        href: "/dashboard/tools/doc-to-udf",
        slug: "udf-toolkit"
    },
    {
        title: "PDF Birleştirici",
        desc: "Birden fazla PDF dökümanını tek bir dosya altında birleştirin.",
        icon: <Layers size={24} />,
        href: "/dashboard/tools/pdf-merge",
        slug: "udf-toolkit"
    },
    {
        title: "TIFF / JPG to PDF",
        desc: "Resim formatındaki dosyalarınızı tek tıkla PDF kitapçığına çevirin.",
        icon: <FileImage size={24} />,
        href: "/dashboard/tools/image-to-pdf",
        slug: "udf-toolkit"
    },
    {
        title: "AI Karar Özeti",
        desc: "Dava dosyalarını yapay zeka ile analiz edin ve özetleyin.",
        icon: <BrainCircuit size={24} />,
        href: "/dashboard/tools/ai-summary",
        slug: "udf-toolkit"
    }
];

export default function ProductsPage() {
    const { data: session } = useSession();
    const user = session?.user as any;
    const activeProductSlugs = user?.activeProductSlugs || [];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">Ürünlerim & Yazılımlar</h1>
                <p className="text-slate-500 font-medium font-sans">Sahip olduğunuz tüm yazılımları ve araçları buradan yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, idx) => {
                    const isLocked = !activeProductSlugs.includes(tool.slug);
                    return (
                        <div key={idx} className="relative group">
                            <Link
                                href={isLocked ? "#" : tool.href}
                                className={`block h-full bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 ${isLocked ? "opacity-60 grayscale cursor-not-allowed" : "hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isLocked ? "bg-slate-100 text-slate-400" : "bg-slate-950 text-[#e6c800]"
                                    }`}>
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-heading font-black text-slate-950 mb-3">{tool.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{tool.desc}</p>

                                {!isLocked ? (
                                    <div className="inline-flex items-center gap-2 text-slate-950 text-sm font-black group-hover:text-[#e6c800] transition-colors">
                                        ARACI AÇ <Box size={16} />
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        KİLİTLİ ÜRÜN
                                    </div>
                                )}
                            </Link>

                            {isLocked && (
                                <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-xl">
                                    <Gem size={16} className="text-slate-400" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!activeProductSlugs.length && (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Box size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-heading font-black text-slate-950 mb-4">Henüz bir ürününüz yok mu?</h2>
                    <p className="text-slate-500 font-medium font-sans mb-8 max-w-md mx-auto">
                        Hukuk teknolojilerinden, dijital araçlara kadar Zygsoft Store'daki gelişmiş yazılımları hemen keşfedin.
                    </p>
                    <Link href="/abonelikler" className="bg-[#e6c800] text-slate-950 px-10 py-4 rounded-2xl text-[14px] font-black hover:bg-slate-950 hover:text-white transition-all shadow-xl shadow-[#e6c800]/20 font-heading">
                        MAĞAZAYA GİT
                    </Link>
                </div>
            )}
        </div>
    );
}
