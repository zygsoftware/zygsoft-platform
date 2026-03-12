"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, FileText, FileStack } from "lucide-react";

type RelatedServicesCTAProps = {
    locale: string;
};

export function RelatedServicesCTA({ locale }: RelatedServicesCTAProps) {
    const isTr = locale === "tr";
    const services = [
        {
            href: "/dijital-urunler/hukuk-araclari-paketi",
            icon: FileText,
            title: isTr ? "Hukuk Araçları Paketi" : "Legal Tools Suite",
            desc: isTr ? "UYAP uyumlu belge dönüştürme araçları" : "UYAP-compatible document conversion tools",
        },
        {
            href: "/dijital-urunler/hukuk-araclari-paketi",
            icon: FileStack,
            title: isTr ? "Belge Araçları Paketi" : "Document Tools Package",
            desc: isTr ? "PDF, OCR, birleştirme ve daha fazlası" : "PDF, OCR, merge and more",
        },
    ];

    return (
        <div className="p-6 bg-white rounded-2xl border border-[#0a0c10]/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <h3 className="font-display font-bold text-[#0e0e0e] text-lg mb-4">
                {isTr ? "İlgili Hizmetler" : "Related Services"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((s, i) => (
                    <Link
                        key={`${s.title}-${i}`}
                        href={s.href}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#e6c800]/50 hover:bg-slate-50/50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#e6c800]/20 flex items-center justify-center shrink-0 group-hover:bg-[#e6c800]/30 transition-colors">
                            <s.icon size={20} className="text-[#0a0c10]" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[#0e0e0e] group-hover:text-[#e6c800] transition-colors">{s.title}</p>
                            <p className="text-sm text-slate-500 truncate">{s.desc}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-[#e6c800] group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
