"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectEditorForm } from "@/components/admin/ProjectEditorForm";
import type { ProjectFormData } from "@/components/admin/ProjectEditorForm";

export default function AdminProjectNewPage() {
    const router = useRouter();

    const handleSubmit = async (data: ProjectFormData) => {
        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Kaydetme başarısız");
        }
        router.push("/admin/projects");
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/projects" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Yeni Proje</h1>
                    <p className="text-slate-500 mt-1 text-sm">Yeni bir proje / case study oluşturun.</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <ProjectEditorForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
