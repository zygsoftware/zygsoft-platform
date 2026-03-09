"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

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
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <DashboardSidebar />
            <main className="flex-1 min-w-0">
                <div className="h-full p-8 lg:p-12 overflow-y-auto">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>
        </div>
    );
}
