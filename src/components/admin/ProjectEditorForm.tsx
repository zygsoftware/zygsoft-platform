"use client";

import { useState, useEffect, useCallback } from "react";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { Loader2, ImagePlus, Eye, Save, Send, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c");
}

type Category = { id: string; name_tr: string; name_en: string; slug: string };

export type ProjectFormData = {
    slug: string;
    title_tr: string;
    title_en: string;
    excerpt_tr: string;
    excerpt_en: string;
    content_tr: string;
    content_en: string;
    category_id: string;
    sector: string;
    service_type: string;
    technologies: string;
    client_name: string;
    is_anonymous_client: boolean;
    project_date: string;
    cover_image: string;
    cover_image_alt_tr: string;
    cover_image_alt_en: string;
    cover_image_title_tr: string;
    cover_image_title_en: string;
    cover_image_caption_tr: string;
    cover_image_caption_en: string;
    problem_tr: string;
    problem_en: string;
    solution_tr: string;
    solution_en: string;
    process_tr: string;
    process_en: string;
    result_tr: string;
    result_en: string;
    metric_label_1_tr: string;
    metric_label_1_en: string;
    metric_value_1: string;
    metric_label_2_tr: string;
    metric_label_2_en: string;
    metric_value_2: string;
    metric_label_3_tr: string;
    metric_label_3_en: string;
    metric_value_3: string;
    live_url: string;
    demo_url: string;
    github_url: string;
    seo_title_tr: string;
    seo_title_en: string;
    seo_description_tr: string;
    seo_description_en: string;
    seo_keywords_tr: string;
    seo_keywords_en: string;
    canonical_url: string;
    og_image: string;
    status: "draft" | "published";
    published_at: string;
    featured: boolean;
    sort_order: number | "";
};

const INITIAL: ProjectFormData = {
    slug: "",
    title_tr: "",
    title_en: "",
    excerpt_tr: "",
    excerpt_en: "",
    content_tr: "",
    content_en: "",
    category_id: "",
    sector: "",
    service_type: "",
    technologies: "",
    client_name: "",
    is_anonymous_client: false,
    project_date: "",
    cover_image: "",
    cover_image_alt_tr: "",
    cover_image_alt_en: "",
    cover_image_title_tr: "",
    cover_image_title_en: "",
    cover_image_caption_tr: "",
    cover_image_caption_en: "",
    problem_tr: "",
    problem_en: "",
    solution_tr: "",
    solution_en: "",
    process_tr: "",
    process_en: "",
    result_tr: "",
    result_en: "",
    metric_label_1_tr: "",
    metric_label_1_en: "",
    metric_value_1: "",
    metric_label_2_tr: "",
    metric_label_2_en: "",
    metric_value_2: "",
    metric_label_3_tr: "",
    metric_label_3_en: "",
    metric_value_3: "",
    live_url: "",
    demo_url: "",
    github_url: "",
    seo_title_tr: "",
    seo_title_en: "",
    seo_description_tr: "",
    seo_description_en: "",
    seo_keywords_tr: "",
    seo_keywords_en: "",
    canonical_url: "",
    og_image: "",
    status: "draft",
    published_at: "",
    featured: false,
    sort_order: "",
};

type ProjectEditorFormProps = {
    initialData?: Partial<ProjectFormData>;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    isEdit?: boolean;
    projectId?: string;
};

function completionScore(form: ProjectFormData, lang: "tr" | "en"): number {
    const fields = lang === "tr"
        ? [form.title_tr, form.excerpt_tr, form.content_tr, form.seo_title_tr, form.seo_description_tr]
        : [form.title_en, form.excerpt_en, form.content_en, form.seo_title_en, form.seo_description_en];
    const filled = fields.filter((f) => f?.trim()).length;
    return Math.round((filled / 5) * 100);
}

export function ProjectEditorForm({ initialData, onSubmit, isEdit, projectId }: ProjectEditorFormProps) {
    const [form, setForm] = useState<ProjectFormData>({ ...INITIAL, ...initialData });
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<"tr" | "en">("tr");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const trComplete = completionScore(form, "tr");
    const enComplete = completionScore(form, "en");
    const enIncomplete = enComplete < 100;
    const hasSeoTr = !!(form.seo_title_tr?.trim() || form.seo_description_tr?.trim());
    const hasSeoEn = !!(form.seo_title_en?.trim() || form.seo_description_en?.trim());
    const seoIncomplete = !hasSeoTr || !hasSeoEn;
    const coverImageAltMissing = !!form.cover_image && !form.cover_image_alt_tr?.trim();

    useEffect(() => {
        fetch("/api/projects/categories").then((r) => r.json()).then(setCategories).catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (!projectId || !form.slug?.trim()) return;
        const timer = setTimeout(async () => {
            setAutosaveStatus("saving");
            try {
                const res = await fetch(`/api/projects/${projectId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, status: "draft" }),
                });
                if (res.ok) {
                    setLastSaved(new Date());
                    setAutosaveStatus("saved");
                    setTimeout(() => setAutosaveStatus("idle"), 2000);
                }
            } catch {
                setAutosaveStatus("idle");
            }
        }, 30000);
        return () => clearTimeout(timer);
    }, [projectId, form, form.slug]);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: "cover_image" | "og_image") => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/projects/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.url) {
                setForm((f) => ({ ...f, [field]: data.url }));
            } else {
                setError(data.error || "Yükleme başarısız");
            }
        } catch {
            setError("Yükleme başarısız");
        } finally {
            setUploading(false);
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent, asDraft?: boolean) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const payload = { ...form, status: asDraft ? "draft" : form.status };
            await onSubmit(payload);
        } catch (err: unknown) {
            const msg = (err as Error)?.message || "Kaydetme başarısız";
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }, [form, onSubmit]);

    const handleTitleTrChange = (v: string) => {
        setForm((f) => ({ ...f, title_tr: v }));
        if (!slugManuallyEdited && !isEdit) setForm((f) => ({ ...f, slug: generateSlug(v) }));
    };

    const SITE = typeof window !== "undefined" ? window.location.origin : "https://zygsoft.com";

    return (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-10">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <div className="sticky top-0 z-20 -mx-8 -mt-8 px-8 pt-8 pb-4 bg-white/98 backdrop-blur-xl border-b border-slate-200/80 shadow-sm mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${form.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}>
                            {form.status === "published" ? "Yayında" : "Taslak"}
                        </span>
                        {projectId && autosaveStatus === "saved" && (
                            <span className="text-xs text-slate-500">Son kayıt: {lastSaved?.toLocaleTimeString("tr-TR")}</span>
                        )}
                        {form.featured && <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200/60">Öne Çıkan</span>}
                        {enIncomplete && <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1"><AlertTriangle size={12} /> EN eksik</span>}
                        {seoIncomplete && <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1"><AlertTriangle size={12} /> SEO eksik</span>}
                        {coverImageAltMissing && <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1"><AlertTriangle size={12} /> Görsel alt metni eksik</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)} disabled={saving} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Taslak Kaydet
                        </button>
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#0e0e0e] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {form.status === "published" ? "Güncelle" : "Yayınla"}
                        </button>
                        {projectId ? (
                            <a href={`/admin/projects/preview/${projectId}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Eye size={16} /> Önizle
                            </a>
                        ) : form.slug ? (
                            <a href={`${SITE}/projeler/${form.slug}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Eye size={16} /> Önizle
                            </a>
                        ) : null}
                        <a href="/admin/projects" className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium">İptal</a>
                    </div>
                </div>
            </div>

            {/* Slug */}
            <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">URL Slug</h3>
                <div className="flex items-center gap-2">
                    <input type="text" required value={form.slug} onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value })); setSlugManuallyEdited(true); }} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-mono text-sm" placeholder="url-slug" />
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, slug: generateSlug(form.title_tr || form.title_en || "") })); setSlugManuallyEdited(false); }} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl">TR başlıktan oluştur</button>
                </div>
            </section>

            {/* 1. Genel Bilgiler */}
            <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Genel Bilgiler</h3>
                <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                    <button type="button" onClick={() => setActiveTab("tr")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px ${activeTab === "tr" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500"}`}>
                        Türkçe {trComplete === 100 ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-xs">%{trComplete}</span>}
                    </button>
                    <button type="button" onClick={() => setActiveTab("en")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px ${activeTab === "en" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500"}`}>
                        English {enComplete === 100 ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-xs text-amber-600">%{enComplete}</span>}
                    </button>
                </div>
                {activeTab === "tr" ? (
                    <div className="space-y-4">
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Başlık (TR) *</label><input type="text" required value={form.title_tr} onChange={(e) => handleTitleTrChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Özet (TR) *</label><textarea required rows={3} value={form.excerpt_tr} onChange={(e) => setForm((f) => ({ ...f, excerpt_tr: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" /></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Title (EN) *</label><input type="text" required value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Excerpt (EN) *</label><textarea required rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" /></div>
                    </div>
                )}
            </section>

            {/* 2. Proje İçeriği */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Proje İçeriği</h3>
                {activeTab === "tr" ? (
                    <div><label className="block text-xs font-bold mb-2">İçerik (TR) *</label><TipTapEditor content={form.content_tr} onChange={(html) => setForm((f) => ({ ...f, content_tr: html }))} placeholder="İçerik yazın..." /></div>
                ) : (
                    <div><label className="block text-xs font-bold mb-2">Content (EN) *</label><TipTapEditor content={form.content_en} onChange={(html) => setForm((f) => ({ ...f, content_en: html }))} placeholder="Write content..." /></div>
                )}
            </section>

            {/* 3. Case Study Blocks */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">3. Case Study Blokları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(["problem", "solution", "process", "result"] as const).map((block) => (
                        <div key={block} className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700 capitalize">{block === "problem" ? "Problem" : block === "solution" ? "Çözüm" : block === "process" ? "Süreç" : "Sonuç"}</h4>
                            <div><label className="block text-xs text-slate-500 mb-1">TR</label><textarea rows={3} value={form[`${block}_tr`]} onChange={(e) => setForm((f) => ({ ...f, [`${block}_tr`]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                            <div><label className="block text-xs text-slate-500 mb-1">EN</label><textarea rows={3} value={form[`${block}_en`]} onChange={(e) => setForm((f) => ({ ...f, [`${block}_en`]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Sınıflandırma */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">4. Sınıflandırma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-xs text-slate-500 mb-2">Kategori</label><select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl"><option value="">Seçin</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name_tr}</option>)}</select></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Sektör</label><input type="text" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="örn. Hukuk" /></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Hizmet Türü</label><input type="text" value={form.service_type} onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="örn. Web Uygulaması" /></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Teknolojiler</label><input type="text" value={form.technologies} onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="React, Next.js, TypeScript (virgülle ayırın)" /></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Müşteri Adı</label><input type="text" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" disabled={form.is_anonymous_client} /><label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" checked={form.is_anonymous_client} onChange={(e) => setForm((f) => ({ ...f, is_anonymous_client: e.target.checked }))} className="rounded" /><span className="text-sm">Anonim müşteri</span></label></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Proje Tarihi</label><input type="date" value={form.project_date} onChange={(e) => setForm((f) => ({ ...f, project_date: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                </div>
            </section>

            {/* 5. Medya */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">5. Medya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><label className="block text-xs text-slate-500 mb-2">Kapak Görseli</label><div className="flex items-center gap-4"><label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium"><ImagePlus size={18} />{uploading ? "Yükleniyor..." : "Görsel Yükle"}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover_image")} disabled={uploading} /></label>{form.cover_image ? <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={form.cover_image} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setForm((f) => ({ ...f, cover_image: "", cover_image_alt_tr: "", cover_image_alt_en: "", cover_image_title_tr: "", cover_image_title_en: "", cover_image_caption_tr: "", cover_image_caption_en: "" }))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div> : <div className="w-32 h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">Boş</div>}</div></div>
                        {form.cover_image && <div className="space-y-2 pt-2 border-t border-slate-100"><div><label className="block text-xs text-slate-500 mb-1">Alt metin (TR) *</label><input type="text" value={form.cover_image_alt_tr} onChange={(e) => setForm((f) => ({ ...f, cover_image_alt_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div><div><label className="block text-xs text-slate-500 mb-1">Alt metin (EN)</label><input type="text" value={form.cover_image_alt_en} onChange={(e) => setForm((f) => ({ ...f, cover_image_alt_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div><div><label className="block text-xs text-slate-500 mb-1">Başlık (TR)</label><input type="text" value={form.cover_image_title_tr} onChange={(e) => setForm((f) => ({ ...f, cover_image_title_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div><div><label className="block text-xs text-slate-500 mb-1">Altyazı (TR)</label><input type="text" value={form.cover_image_caption_tr} onChange={(e) => setForm((f) => ({ ...f, cover_image_caption_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div></div>}
                    </div>
                    <div><label className="block text-xs text-slate-500 mb-2">OG Görsel</label><div className="flex items-center gap-4"><label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium"><ImagePlus size={18} />Yükle<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "og_image")} disabled={uploading} /></label>{form.og_image ? <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200"><img src={form.og_image} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setForm((f) => ({ ...f, og_image: "" }))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div> : <div className="w-32 h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">Kapak kullanılır</div>}</div></div>
                </div>
            </section>

            {/* 6. KPI / Metrics */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">6. Sonuç / KPI Kartları</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {([1, 2, 3] as const).map((n) => (
                        <div key={n} className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
                            <input type="text" value={form[`metric_label_${n}_tr`]} onChange={(e) => setForm((f) => ({ ...f, [`metric_label_${n}_tr`]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={`Etiket ${n} (TR)`} />
                            <input type="text" value={form[`metric_label_${n}_en`]} onChange={(e) => setForm((f) => ({ ...f, [`metric_label_${n}_en`]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={`Label ${n} (EN)`} />
                            <input type="text" value={form[`metric_value_${n}`]} onChange={(e) => setForm((f) => ({ ...f, [`metric_value_${n}`]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Değer" />
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. Bağlantılar */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">7. Bağlantılar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-2">Canlı URL</label><input type="url" value={form.live_url} onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="https://..." /></div>
                    <div><label className="block text-xs text-slate-500 mb-2">Demo URL</label><input type="url" value={form.demo_url} onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="https://..." /></div>
                    <div><label className="block text-xs text-slate-500 mb-2">GitHub URL</label><input type="url" value={form.github_url} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="https://..." /></div>
                </div>
            </section>

            {/* 8. SEO */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">8. SEO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Türkçe</h4>
                        <div><label className="block text-xs text-slate-500 mb-1">SEO Başlık</label><input type="text" value={form.seo_title_tr} onChange={(e) => setForm((f) => ({ ...f, seo_title_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Meta Açıklama</label><textarea rows={2} value={form.seo_description_tr} onChange={(e) => setForm((f) => ({ ...f, seo_description_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Anahtar Kelimeler</label><input type="text" value={form.seo_keywords_tr} onChange={(e) => setForm((f) => ({ ...f, seo_keywords_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase">English</h4>
                        <div><label className="block text-xs text-slate-500 mb-1">SEO Title</label><input type="text" value={form.seo_title_en} onChange={(e) => setForm((f) => ({ ...f, seo_title_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Meta Description</label><textarea rows={2} value={form.seo_description_en} onChange={(e) => setForm((f) => ({ ...f, seo_description_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Keywords</label><input type="text" value={form.seo_keywords_en} onChange={(e) => setForm((f) => ({ ...f, seo_keywords_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                    </div>
                </div>
                <div><label className="block text-xs text-slate-500 mb-2">Canonical URL</label><input type="text" value={form.canonical_url} onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="https://..." /></div>
            </section>

            {/* 9. Yayınlama */}
            <section className="p-6 bg-slate-50 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">9. Yayınlama</h3>
                <div className="flex flex-wrap gap-8">
                    <div><label className="block text-xs text-slate-500 mb-2">Durum</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="status" checked={form.status === "draft"} onChange={() => setForm((f) => ({ ...f, status: "draft" }))} className="rounded" /><span>Taslak</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="status" checked={form.status === "published"} onChange={() => setForm((f) => ({ ...f, status: "published" }))} className="rounded" /><span>Yayınla</span></label></div></div>
                    {form.status === "published" && <div><label className="block text-xs text-slate-500 mb-2">Yayın Tarihi</label><input type="datetime-local" value={form.published_at || new Date().toISOString().slice(0, 16)} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>}
                    <div><label className="block text-xs text-slate-500 mb-2">Sıra</label><input type="number" min={0} value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0 }))} className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="rounded" /><span className="font-medium">Öne çıkan proje</span></label>
            </section>
        </form>
    );
}
