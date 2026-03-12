"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { TrialConversionBanner } from "@/components/dashboard/TrialConversionBanner";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-[#e6c800] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[var(--bg-2)] font-sans">
            <DashboardSidebar />
            <main className="flex-1 min-w-0">
                <div className="h-full p-8 lg:p-12 overflow-y-auto">
                    <Breadcrumbs />
                    <EmailVerificationBanner
                        emailVerified={user?.emailVerified}
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
