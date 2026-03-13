"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function AdminProjectPreviewPage() {
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then(setProject)
            .catch(() => setProject(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#e6c800]" />
            </div>
        );
    }
    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-slate-500 text-lg">Proje bulunamadı.</p>
                <Link href="/admin/projects" className="mt-4 text-[#0e0e0e] font-semibold hover:text-[#e6c800] transition-colors">
                    Projelere dön
                </Link>
            </div>
        );
    }

    const isTr = true;
    const title = isTr ? project.title_tr : project.title_en;
    const excerpt = isTr ? project.excerpt_tr : project.excerpt_en;
    const content = isTr ? project.content_tr : project.content_en;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#fafafc] pt-16">
                <div className="border-b border-slate-200 bg-amber-50/50 py-3 px-6">
                    <div className="container mx-auto max-w-5xl flex items-center justify-between">
                        <span className="text-amber-800 font-medium text-sm">Önizleme modu — Bu proje henüz yayında değil</span>
                        <Link href={`/admin/projects/edit/${id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0e0e0e] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a]">
                            <ArrowLeft size={16} /> Düzenlemeye Dön
                        </Link>
                    </div>
                </div>
                <section className="pt-24 pb-12 md:pt-32 md:pb-16">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <Link href="/admin/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50 mb-8">
                            <ArrowLeft size={14} /> Projelere Dön
                        </Link>
                        {project.category && (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#e6c800]/20 text-[#0a0c10] text-[11px] font-bold uppercase tracking-wider mb-4">
                                {isTr ? project.category.name_tr : project.category.name_en}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-[#0e0e0e] mb-6">
                            {title}
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed">{excerpt}</p>
                    </div>
                </section>
                {project.cover_image && (
                    <section className="container mx-auto px-6 max-w-5xl -mt-4 mb-12">
                        <div className="relative aspect-video md:aspect-[21/9] bg-slate-100 rounded-xl overflow-hidden">
                            <Image src={project.cover_image} alt={project.cover_image_alt_tr || project.cover_image_alt_en || title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
                        </div>
                    </section>
                )}
                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="prose-article max-w-none" dangerouslySetInnerHTML={{ __html: content || "<p>İçerik yok.</p>" }} />
                        {(project.problem_tr || project.problem_en) && (
                            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="font-display font-bold text-lg text-[#0e0e0e] mb-3">Problem</h3>
                                <p className="text-slate-600 leading-relaxed">{isTr ? project.problem_tr : project.problem_en}</p>
                            </div>
                        )}
                        {(project.solution_tr || project.solution_en) && (
                            <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="font-display font-bold text-lg text-[#0e0e0e] mb-3">Çözüm</h3>
                                <p className="text-slate-600 leading-relaxed">{isTr ? project.solution_tr : project.solution_en}</p>
                            </div>
                        )}
                        {(project.result_tr || project.result_en) && (
                            <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="font-display font-bold text-lg text-[#0e0e0e] mb-3">Sonuç</h3>
                                <p className="text-slate-600 leading-relaxed">{isTr ? project.result_tr : project.result_en}</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
