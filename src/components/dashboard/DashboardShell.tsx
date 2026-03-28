"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { TrialConversionBanner } from "@/components/dashboard/TrialConversionBanner";
import { useTranslations } from "next-intl";

type DashboardShellUser = {
    emailVerified?: boolean | Date | null;
    role?: string | null;
    trialStatus?: string;
    activeProductSlugs?: string[];
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations("Dashboard.shared.shell");
    const user = session?.user as DashboardShellUser | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileOpen]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-[#e6c800] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[var(--bg-2)] font-sans">
            <DashboardSidebar className="hidden lg:flex lg:w-72 lg:h-screen lg:sticky lg:top-0" />

            <div className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileOpen(false)} />

            <DashboardSidebar
                className={`fixed inset-y-0 left-0 z-50 h-screen w-[88vw] max-w-[340px] shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                onNavigate={() => setMobileOpen(false)}
            />

            <main className="flex-1 min-w-0">
                <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/92 px-4 py-3 backdrop-blur lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                            aria-label={mobileOpen ? t("menuClose") : t("menuOpen")}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black tracking-tight text-slate-950">{t("panelTitle")}</p>
                            <p className="truncate text-xs font-medium text-slate-400">{t("panelSubtitle")}</p>
                        </div>
                    </div>
                </div>

                <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-12">
                    <Breadcrumbs />
                    <EmailVerificationBanner
                        emailVerified={user?.emailVerified ?? null}
                        isAdmin={user?.role === "admin"}
                    />
                    <TrialConversionBanner
                        trialStatus={user?.trialStatus ?? "none"}
                        hasSubscription={((user?.activeProductSlugs as string[] | undefined)?.includes("legal-toolkit") ?? false) || user?.role === "admin"}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
}
