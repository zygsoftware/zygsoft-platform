"use client";

import { useState, useEffect, useCallback } from "react";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { Loader2, ImagePlus, Eye, Save, Send, AlertTriangle, CheckCircle } from "lucide-react";

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

function estimateReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

type Category = { id: string; name_tr: string; name_en: string; slug: string };
type Tag = { id: string; name: string; slug: string };

export type BlogFormData = {
    slug: string;
    title_tr: string;
    title_en: string;
    excerpt_tr: string;
    excerpt_en: string;
    content_tr: string;
    content_en: string;
    cover_image: string;
    seo_title_tr: string;
    seo_title_en: string;
    seo_description_tr: string;
    seo_description_en: string;
    seo_keywords_tr: string;
    seo_keywords_en: string;
    og_image: string;
    canonical_url: string;
    category_id: string;
    allow_comments: boolean;
    tag_ids: string[];
    is_featured: boolean;
    status: "draft" | "published";
    published_at: string;
    reading_time_min?: number;
};

const INITIAL: BlogFormData = {
    slug: "",
    title_tr: "",
    title_en: "",
    excerpt_tr: "",
    excerpt_en: "",
    content_tr: "",
    content_en: "",
    cover_image: "",
    seo_title_tr: "",
    seo_title_en: "",
    seo_description_tr: "",
    seo_description_en: "",
    seo_keywords_tr: "",
    seo_keywords_en: "",
    og_image: "",
    canonical_url: "",
    category_id: "",
    allow_comments: true,
    tag_ids: [],
    is_featured: false,
    status: "draft",
    published_at: "",
};

type BlogEditorFormProps = {
    initialData?: Partial<BlogFormData>;
    onSubmit: (data: BlogFormData) => Promise<void>;
    isEdit?: boolean;
    postId?: string;
};

function completionScore(form: BlogFormData, lang: "tr" | "en"): number {
    const fields = lang === "tr"
        ? [form.title_tr, form.excerpt_tr, form.content_tr, form.seo_title_tr, form.seo_description_tr]
        : [form.title_en, form.excerpt_en, form.content_en, form.seo_title_en, form.seo_description_en];
    const filled = fields.filter((f) => f?.trim()).length;
    return Math.round((filled / 5) * 100);
}

export function BlogEditorForm({ initialData, onSubmit, isEdit, postId }: BlogEditorFormProps) {
    const [form, setForm] = useState<BlogFormData>({ ...INITIAL, ...initialData });
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [activeTab, setActiveTab] = useState<"tr" | "en">("tr");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const readingTimeTr = estimateReadingTime(form.content_tr || "");
    const readingTimeEn = estimateReadingTime(form.content_en || "");
    const readingTime = form.reading_time_min ?? Math.max(readingTimeTr, readingTimeEn);
    const trComplete = completionScore(form, "tr");
    const enComplete = completionScore(form, "en");
    const enIncomplete = enComplete < 100;
    const hasSeoTr = !!(form.seo_title_tr?.trim() || form.seo_description_tr?.trim());
    const hasSeoEn = !!(form.seo_title_en?.trim() || form.seo_description_en?.trim());
    const seoIncomplete = !hasSeoTr || !hasSeoEn;

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    useEffect(() => {
        fetch("/api/blog/categories").then((r) => r.json()).then(setCategories).catch(() => setCategories([]));
        fetch("/api/blog/tags").then((r) => r.json()).then(setTags).catch(() => setTags([]));
    }, []);

    useEffect(() => {
        if (!postId || !form.slug?.trim()) return;
        const timer = setTimeout(async () => {
            setAutosaveStatus("saving");
            try {
                const res = await fetch(`/api/blog/${postId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        status: "draft",
                        reading_time_min: form.reading_time_min ?? Math.max(estimateReadingTime(form.content_tr || ""), estimateReadingTime(form.content_en || "")),
                    }),
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
    }, [postId, form, form.slug]);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: "cover_image" | "og_image") => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/blog/upload", { method: "POST", body: fd });
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
            const payload = {
                ...form,
                status: asDraft ? "draft" : form.status,
                reading_time_min: form.reading_time_min ?? Math.max(readingTimeTr, readingTimeEn),
            };
            await onSubmit(payload);
        } catch (err: unknown) {
            setError((err as Error)?.message || "Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    }, [form, onSubmit, readingTimeTr, readingTimeEn]);

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

            {/* Sticky action bar */}
            <div className="sticky top-0 z-20 -mx-8 -mt-8 px-8 pt-8 pb-4 bg-white/98 backdrop-blur-xl border-b border-slate-200/80 shadow-sm mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${form.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}>
                            {form.status === "published" ? "Yayında" : "Taslak"}
                        </span>
                        {postId && autosaveStatus === "saved" && (
                            <span className="text-xs text-slate-500">Son kayıt: {lastSaved?.toLocaleTimeString("tr-TR")}</span>
                        )}
                        {form.is_featured && <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200/60">Öne Çıkan</span>}
                        {enIncomplete && (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                                <AlertTriangle size={12} /> EN eksik
                            </span>
                        )}
                        {seoIncomplete && (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1">
                                <AlertTriangle size={12} /> SEO eksik
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                            disabled={saving}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Taslak Kaydet
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#0e0e0e] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {form.status === "published" ? "Güncelle" : "Yayınla"}
                        </button>
                        {postId ? (
                            <a
                                href={`/admin/blog/preview/${postId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                                <Eye size={16} /> Önizle
                            </a>
                        ) : form.slug ? (
                            <a
                                href={`${SITE}/blog/${form.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                                <Eye size={16} /> Önizle
                            </a>
                        ) : null}
                        <a href="/admin/blog" className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                            İptal
                        </a>
                    </div>
                </div>
            </div>

            {/* Slug */}
            <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">URL Slug</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => {
                            setForm((f) => ({ ...f, slug: e.target.value }));
                            setSlugManuallyEdited(true);
                        }}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-mono text-sm"
                        placeholder="url-slug"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setForm((f) => ({ ...f, slug: generateSlug(form.title_tr || form.title_en || "") }));
                            setSlugManuallyEdited(false);
                        }}
                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                    >
                        TR başlıktan oluştur
                    </button>
                </div>
                <p className="text-xs text-slate-500">Türkçe başlıktan otomatik oluşturulur. Manuel değiştirebilirsiniz.</p>
            </section>

            {/* Language tabs */}
            <section>
                <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("tr")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === "tr" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        Türkçe
                        {trComplete === 100 ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-xs font-normal">%{trComplete}</span>}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("en")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === "en" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        English
                        {enComplete === 100 ? <CheckCircle size={14} className="text-emerald-500" /> : <span className="text-xs font-normal text-amber-600">%{enComplete}</span>}
                    </button>
                </div>

                {activeTab === "tr" ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Başlık (TR) *</label>
                            <input type="text" required value={form.title_tr} onChange={(e) => handleTitleTrChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Türkçe başlık" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Özet (TR) *</label>
                            <textarea required rows={3} value={form.excerpt_tr} onChange={(e) => setForm((f) => ({ ...f, excerpt_tr: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" placeholder="Kısa özet..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">İçerik (TR) *</label>
                            <TipTapEditor content={form.content_tr} onChange={(html) => setForm((f) => ({ ...f, content_tr: html }))} placeholder="İçerik yazın..." />
                        </div>
                        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">SEO (TR)</h4>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">SEO Başlık</label>
                                <input type="text" value={form.seo_title_tr} onChange={(e) => setForm((f) => ({ ...f, seo_title_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Boş bırakılırsa başlık kullanılır" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Meta Açıklama</label>
                                <textarea rows={2} value={form.seo_description_tr} onChange={(e) => setForm((f) => ({ ...f, seo_description_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Anahtar Kelimeler</label>
                                <input type="text" value={form.seo_keywords_tr} onChange={(e) => setForm((f) => ({ ...f, seo_keywords_tr: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="kelime1, kelime2" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Title (EN) *</label>
                            <input type="text" required value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="English title" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Excerpt (EN) *</label>
                            <textarea required rows={3} value={form.excerpt_en} onChange={(e) => setForm((f) => ({ ...f, excerpt_en: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none" placeholder="Short excerpt..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Content (EN) *</label>
                            <TipTapEditor content={form.content_en} onChange={(html) => setForm((f) => ({ ...f, content_en: html }))} placeholder="Write content..." />
                        </div>
                        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">SEO (EN)</h4>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">SEO Title</label>
                                <input type="text" value={form.seo_title_en} onChange={(e) => setForm((f) => ({ ...f, seo_title_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Meta Description</label>
                                <textarea rows={2} value={form.seo_description_en} onChange={(e) => setForm((f) => ({ ...f, seo_description_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Keywords</label>
                                <input type="text" value={form.seo_keywords_en} onChange={(e) => setForm((f) => ({ ...f, seo_keywords_en: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="keyword1, keyword2" />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Media */}
            <section className="space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Medya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">Kapak Görseli</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors">
                                <ImagePlus size={18} />
                                {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover_image")} disabled={uploading} />
                            </label>
                            {form.cover_image ? (
                                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image: "" }))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                                </div>
                            ) : (
                                <div className="w-32 h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">Boş</div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">OG Görsel (Sosyal Paylaşım)</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors">
                                <ImagePlus size={18} />
                                Yükle
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "og_image")} disabled={uploading} />
                            </label>
                            {form.og_image ? (
                                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={form.og_image} alt="OG" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setForm((f) => ({ ...f, og_image: "" }))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                                </div>
                            ) : (
                                <div className="w-32 h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">Kapak kullanılır</div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-2">Canonical URL</label>
                    <input type="text" value={form.canonical_url} onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="https://example.com/blog/slug" />
                </div>
            </section>

            {/* SEO Preview */}
            <section className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Arama Önizlemesi</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Türkçe</p>
                        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                            <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                                {form.seo_title_tr || form.title_tr || "Başlık"} | ZYGSOFT Blog
                            </p>
                            <p className="text-green-700 text-sm mt-0.5">{SITE}/blog/{form.slug || "slug"}</p>
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                {form.seo_description_tr || form.excerpt_tr || "Açıklama..."}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{(form.seo_description_tr || form.excerpt_tr || "").length} / 160 karakter</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">English</p>
                        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                            <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                                {form.seo_title_en || form.title_en || "Title"} | ZYGSOFT Blog
                            </p>
                            <p className="text-green-700 text-sm mt-0.5">{SITE}/en/blog/{form.slug || "slug"}</p>
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                {form.seo_description_en || form.excerpt_en || "Description..."}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{(form.seo_description_en || form.excerpt_en || "").length} / 160 characters</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Taxonomy */}
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Kategori & Etiketler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">Kategori</label>
                        <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                            <option value="">Seçin</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name_tr}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">Etiketler</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((t) => (
                                <label key={t.id} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                                    <input type="checkbox" checked={form.tag_ids.includes(t.id)} onChange={(e) => setForm((f) => ({ ...f, tag_ids: e.target.checked ? [...f.tag_ids, t.id] : f.tag_ids.filter((id) => id !== t.id) }))} className="rounded" />
                                    <span className="text-sm">{t.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Publishing & Interaction */}
            <section className="p-6 bg-slate-50 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Yayınlama & Etkileşim</h3>
                <div className="flex flex-wrap gap-8">
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">Durum</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={form.status === "draft"} onChange={() => setForm((f) => ({ ...f, status: "draft" }))} className="rounded" />
                                <span>Taslak</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={form.status === "published"} onChange={() => setForm((f) => ({ ...f, status: "published" }))} className="rounded" />
                                <span>Yayınla</span>
                            </label>
                        </div>
                    </div>
                    {form.status === "published" && (
                        <div>
                            <label className="block text-xs text-slate-500 mb-2">Yayın Tarihi</label>
                            <input type="datetime-local" value={form.published_at || new Date().toISOString().slice(0, 16)} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2">Okuma Süresi</label>
                        <div className="flex items-center gap-2">
                            <input type="number" min={1} max={120} value={readingTime} onChange={(e) => setForm((f) => ({ ...f, reading_time_min: parseInt(e.target.value, 10) || undefined }))} className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            <span className="text-xs text-slate-500">dk (TR: {readingTimeTr}, EN: {readingTimeEn})</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                        <span className="font-medium">Öne çıkan yazı</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.allow_comments} onChange={(e) => setForm((f) => ({ ...f, allow_comments: e.target.checked }))} className="rounded" />
                        <span className="font-medium">Yorumlara izin ver</span>
                    </label>
                </div>
            </section>
        </form>
    );
}
