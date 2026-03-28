"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export default function DashboardBillingRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const product = searchParams.get("product");
        const target = product ? `/payment?product=${encodeURIComponent(product)}` : "/payment";
        router.replace(target);
    }, [router, searchParams]);

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">
                Redirecting to payment page...
            </p>
        </div>
    );
}
