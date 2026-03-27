"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--bg-2)]">
            <AdminSidebar className="hidden lg:flex lg:w-64 lg:h-screen lg:fixed lg:inset-y-0 lg:left-0 lg:z-20" />

            <div className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileOpen(false)} />

            <AdminSidebar
                className={`fixed inset-y-0 left-0 z-50 h-screen w-[86vw] max-w-[320px] shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                onNavigate={() => setMobileOpen(false)}
            />

            <div className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 min-h-[64px] shrink-0 bg-white/92 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 sm:px-6 lg:px-8 lg:py-4 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
                            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <Image
                                src="/brand/ZYGLogo.png"
                                alt="ZYGSOFT"
                                className="h-4 w-auto"
                                width={90}
                                height={16}
                            />
                            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">Yönetim Paneli</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0e0e0e] flex items-center justify-center text-[#e6c800] text-xs font-bold">
                            Z
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-w-0 px-4 pt-5 pb-6 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8 relative overflow-hidden">
                    <div
                        className="absolute top-0 right-0 h-[320px] w-[320px] rounded-full pointer-events-none blur-3xl opacity-40 lg:h-[400px] lg:w-[400px]"
                        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.15) 0%, transparent 70%)" }}
                    />
                    <div className="relative z-10 min-w-0 w-full max-w-full pt-2 lg:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
