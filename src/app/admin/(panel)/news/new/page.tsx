"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogEditorForm, type BlogFormData } from "@/components/admin/BlogEditorForm";

export default function AdminNewsNewPage() {
    const router = useRouter();

    const handleSubmit = async (data: BlogFormData) => {
        const res = await fetch("/api/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Kaydetme başarısız");
        }
        router.push("/admin/news");
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/news" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Yeni Haber</h1>
                    <p className="text-slate-500 mt-1 text-sm">Editoryal akışınıza yeni bir haber ekleyin.</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <BlogEditorForm
                    onSubmit={handleSubmit}
                    adminBasePath="/admin/news"
                    publicBasePath="/news"
                    publicSectionLabel="News"
                    hideCategoryField
                />
            </div>
        </div>
    );
}
