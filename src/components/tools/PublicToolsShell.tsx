"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type PublicToolsShellProps = {
    children: React.ReactNode;
    compact?: boolean;
};

export function PublicToolsShell({ children, compact = false }: PublicToolsShellProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f5f2eb] text-[#343131]">
            <div className={`pointer-events-none absolute inset-x-0 top-0 ${compact ? "h-[360px]" : "h-[520px]"} bg-[radial-gradient(circle_at_top_left,rgba(230,200,0,0.12),transparent_36%),radial-gradient(circle_at_top_right,rgba(15,19,36,0.05),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,242,235,0))]`} />
            <div className={`pointer-events-none absolute left-[-120px] ${compact ? "top-[100px] h-[180px] w-[180px]" : "top-[180px] h-[320px] w-[320px]"} rounded-full bg-[#e6c800]/10 blur-3xl`} />
            <div className={`pointer-events-none absolute right-[-120px] ${compact ? "top-[140px] h-[180px] w-[180px]" : "top-[300px] h-[280px] w-[280px]"} rounded-full bg-[#0f1324]/5 blur-3xl`} />
            <Header />
            <main className={compact ? "relative z-10 pt-28 pb-16" : "relative z-10 pt-28 pb-20"}>
                <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${compact ? "max-w-5xl" : "max-w-6xl"}`}>
                    {compact ? (
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/55 to-transparent" />
                            {children}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
