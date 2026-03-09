"use client";

import { motion } from "framer-motion";
import {
    Code,
    Search,
    Zap,
    Globe,
    CheckCircle2,
    Clock,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

const services = [
    {
        title: "Kurumsal Web Yazılım",
        id: "ZYG-WEB-001",
        status: "active",
        date: "12 Mar 2024",
        icon: Code,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        title: "SEO & Dijital Pazarlama",
        id: "ZYG-SEO-042",
        status: "pending",
        date: "28 Feb 2024",
        icon: Search,
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    }
];

export default function ServicesPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">Hizmetlerim & Projeler</h1>
                <p className="text-slate-500 font-medium font-sans">Zygsoft ile yürüttüğünüz tüm danışmanlık ve proje süreçleri.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Hizmet Detayı</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Sözleşme No</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Durum</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Başlangıç</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty State for now as realistic demo */}
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <Globe size={48} className="text-slate-200 mx-auto mb-6" />
                                        <h3 className="text-lg font-heading font-black text-slate-950 mb-2">Henüz Aktif Hizmet Yok</h3>
                                        <p className="text-sm text-slate-400 font-medium mb-6">Özel yazılım veya SEO hizmeti aldığınızda sözleşmeleriniz burada listelenir.</p>
                                        <Link href="/contact" className="text-[#e6c800] text-sm font-black border-b-2 border-[#e6c800] hover:text-slate-950 hover:border-slate-950 transition-all">
                                            TEKLİF ALIN
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Kod Kalitesi", desc: "En modern teknolojilerle temiz kod.", icon: Zap },
                    { title: "7/24 İzleme", desc: "Projeleriniz her zaman gözetim altında.", icon: Clock },
                    { title: "Uzman Ekip", desc: "Alanında profesyonel geliştiriciler.", icon: CheckCircle2 }
                ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-slate-50 text-slate-950 rounded-xl flex items-center justify-center mb-6">
                            <feature.icon size={24} />
                        </div>
                        <h4 className="font-heading font-black text-slate-950 mb-2">{feature.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
