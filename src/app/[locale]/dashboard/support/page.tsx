"use client";

import { motion } from "framer-motion";
import {
    Plus,
    MessageSquare,
    FileText,
    Clock,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-950 mb-2">Destek Merkezi</h1>
                    <p className="text-slate-500 font-medium font-sans">Bir sorun mu yaşıyorsunuz? Uzman ekibimize bildirin.</p>
                </div>
                <button className="bg-slate-950 text-white px-8 py-4 rounded-2xl text-[14px] font-black hover:bg-[#e6c800] hover:text-slate-950 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 font-heading">
                    <Plus size={20} /> YENİ TALEP OLUŞTUR
                </button>
            </div>

            {/* Support Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQ / Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#e6c800] p-8 rounded-[2rem] shadow-xl shadow-[#e6c800]/20">
                        <AlertCircle size={32} className="text-slate-950 mb-6" />
                        <h3 className="text-xl font-heading font-black text-slate-950 mb-4">Hızlı Çözümler</h3>
                        <p className="text-slate-900/70 text-sm font-bold leading-relaxed mb-6">
                            Talebinizi iletmeden önce Kullanım Kılavuzumuzu inceleyerek en sık karşılaşılan sorulara yanıt bulabilirsiniz.
                        </p>
                        <button className="w-full bg-slate-950 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all">
                            DOKÜMANTASYON <ArrowRight size={14} className="inline ml-2" />
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="font-heading font-black text-slate-950 mb-6">Ortalama Yanıt Süreleri</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                <span className="text-sm text-slate-500 font-medium">Yazılım Sorunu</span>
                                <span className="text-sm text-emerald-600 font-black">2 Saat</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                <span className="text-sm text-slate-500 font-medium">Genel Destek</span>
                                <span className="text-sm text-blue-600 font-black">4 Saat</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">Özel Yazılım</span>
                                <span className="text-sm text-purple-600 font-black">24 Saat</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="text-lg font-heading font-black text-slate-950">Geçmiş ve Aktif Talepler</h3>
                        </div>
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare size={32} className="text-slate-200" />
                            </div>
                            <h4 className="text-lg font-heading font-black text-slate-950 mb-2">Talebiniz Bulunmuyor</h4>
                            <p className="text-slate-400 text-sm font-medium">Herhangi bir teknik sorun veya sorunuz olduğunda yeni bir talep başlatabilirsiniz.</p>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-[#e6c800]">
                                <FileText size={18} />
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-950 text-sm mb-1">Detaylı Bilgi Verin</h5>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Sorunu ekran görüntüleri ile detaylandırmanız çözümü hızlandırır.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-[#e6c800]">
                                <Clock size={18} />
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-950 text-sm mb-1">Takipte Kalın</h5>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Talebinize yanıt geldiğinde sistem üzerinden bildirim alacaksınız.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
