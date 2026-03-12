"use client";

import Link from "next/link";
import { ShieldAlert, Zap } from "lucide-react";
import { TrialRequestCTA } from "@/components/trial/TrialRequestCTA";

type ToolLockedGateProps = {
    session: { user?: Record<string, unknown> } | null;
};

export function ToolLockedGate({ session }: ToolLockedGateProps) {
    const user = session?.user as any;

    return (
        <div className="bg-white rounded-[2.5rem] p-12 md:p-16 border border-slate-200 text-center shadow-sm relative overflow-hidden">
            <div className="w-24 h-24 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8 border border-amber-100">
                <ShieldAlert size={48} />
            </div>
            <h2 className="text-3xl font-display font-black text-[#0a0c10] mb-4">Erişim Kısıtlı</h2>
            <p className="text-[#0a0c10]/60 font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Bu aracı kullanabilmek için aktif bir <strong>Hukuk Araçları Paketi</strong> aboneliğinizin veya demo erişiminizin olması gerekmektedir.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
                {user && (
                    <TrialRequestCTA
                        emailVerified={user?.emailVerified ?? false}
                        trialStatus={user?.trialStatus ?? "none"}
                        hasSubscription={false}
                        source="tool-page"
                    />
                )}
                <Link href="/dijital-urunler/hukuk-araclari-paketi" className="bg-slate-100 text-[#0a0c10] px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-slate-200 transition-all inline-flex items-center gap-3">
                    Paketi İncele <Zap size={18} fill="currentColor" />
                </Link>
                <Link href="/dashboard/billing?product=legal-toolkit" className="bg-[#0a0c10] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#0a0c10]/90 transition-all shadow-xl inline-flex items-center gap-3">
                    Ödeme Bildir
                </Link>
            </div>
        </div>
    );
}
