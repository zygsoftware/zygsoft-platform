"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ProjectEditorForm } from "@/components/admin/ProjectEditorForm";
import type { ProjectFormData } from "@/components/admin/ProjectEditorForm";

function toFormData(project: any): Partial<ProjectFormData> {
    return {
        slug: project.slug ?? "",
        title_tr: project.title_tr ?? "",
        title_en: project.title_en ?? "",
        excerpt_tr: project.excerpt_tr ?? "",
        excerpt_en: project.excerpt_en ?? "",
        content_tr: project.content_tr ?? "",
        content_en: project.content_en ?? "",
        category_id: project.category_id ?? "",
        sector: project.sector ?? "",
        service_type: project.service_type ?? "",
        technologies: project.technologies ?? "",
        client_name: project.client_name ?? "",
        is_anonymous_client: project.is_anonymous_client ?? false,
        project_date: project.project_date ? new Date(project.project_date).toISOString().slice(0, 10) : "",
        cover_image: project.cover_image ?? "",
        cover_image_alt_tr: project.cover_image_alt_tr ?? "",
        cover_image_alt_en: project.cover_image_alt_en ?? "",
        cover_image_title_tr: project.cover_image_title_tr ?? "",
        cover_image_title_en: project.cover_image_title_en ?? "",
        cover_image_caption_tr: project.cover_image_caption_tr ?? "",
        cover_image_caption_en: project.cover_image_caption_en ?? "",
        problem_tr: project.problem_tr ?? "",
        problem_en: project.problem_en ?? "",
        solution_tr: project.solution_tr ?? "",
        solution_en: project.solution_en ?? "",
        process_tr: project.process_tr ?? "",
        process_en: project.process_en ?? "",
        result_tr: project.result_tr ?? "",
        result_en: project.result_en ?? "",
        metric_label_1_tr: project.metric_label_1_tr ?? "",
        metric_label_1_en: project.metric_label_1_en ?? "",
        metric_value_1: project.metric_value_1 ?? "",
        metric_label_2_tr: project.metric_label_2_tr ?? "",
        metric_label_2_en: project.metric_label_2_en ?? "",
        metric_value_2: project.metric_value_2 ?? "",
        metric_label_3_tr: project.metric_label_3_tr ?? "",
        metric_label_3_en: project.metric_label_3_en ?? "",
        metric_value_3: project.metric_value_3 ?? "",
        live_url: project.live_url ?? "",
        demo_url: project.demo_url ?? "",
        github_url: project.github_url ?? "",
        seo_title_tr: project.seo_title_tr ?? "",
        seo_title_en: project.seo_title_en ?? "",
        seo_description_tr: project.seo_description_tr ?? "",
        seo_description_en: project.seo_description_en ?? "",
        seo_keywords_tr: project.seo_keywords_tr ?? "",
        seo_keywords_en: project.seo_keywords_en ?? "",
        canonical_url: project.canonical_url ?? "",
        og_image: project.og_image ?? "",
        status: project.published ? "published" : "draft",
        published_at: project.published_at ? new Date(project.published_at).toISOString().slice(0, 16) : "",
        featured: project.featured ?? false,
        sort_order: project.sort_order ?? "",
    };
}

export default function AdminProjectEditPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((d) => {
                setProject(d);
            })
            .catch(() => setProject(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (data: ProjectFormData) => {
        const res = await fetch(`/api/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Güncelleme başarısız");
        }
        router.push("/admin/projects");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[#e6c800]" />
            </div>
        );
    }
    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="text-slate-500 text-lg">Proje bulunamadı.</p>
                <Link href="/admin/projects" className="mt-4 text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors">
                    Projelere dön
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/projects" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Proje Düzenle</h1>
                    <p className="text-slate-500 mt-1 text-sm">{project.title_tr}</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <ProjectEditorForm initialData={toFormData(project)} onSubmit={handleSubmit} isEdit projectId={id} />
            </div>
        </div>
    );
}
