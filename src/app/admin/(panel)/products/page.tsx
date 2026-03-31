"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
    AlertCircle,
    Check,
    Edit2,
    ImagePlus,
    Loader2,
    Package,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

type Product = {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    iconType: string;
    isActive: boolean;
    imageUrl?: string | null;
    imagePath?: string | null;
};

type ProductForm = Partial<Product>;

const EMPTY_PRODUCT: ProductForm = {
    name: "",
    slug: "",
    description: "",
    category: "general",
    price: 0,
    iconType: "blocks",
    isActive: true,
    imageUrl: "",
    imagePath: "",
};

const categories = [
    { id: "hukuk", label: "Hukuk Sistemleri" },
    { id: "seo", label: "SEO Araçları" },
    { id: "web", label: "Web Hizmetleri" },
    { id: "general", label: "Genel" },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<ProductForm>(EMPTY_PRODUCT);

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return products;

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(q) ||
                product.slug.toLowerCase().includes(q) ||
                product.category.toLowerCase().includes(q)
            );
        });
    }, [products, searchTerm]);

    async function fetchProducts() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ürünler yüklenemedi.");
                setProducts([]);
                return;
            }

            setProducts(data.products ?? []);
        } catch {
            setError("Bağlantı hatası. Lütfen tekrar deneyin.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    function handleOpenModal(product?: Product) {
        setCurrentProduct(product ? { ...product } : { ...EMPTY_PRODUCT });
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        if (actionLoading || uploadingImage) return;
        setIsModalOpen(false);
        setCurrentProduct({ ...EMPTY_PRODUCT });
    }

    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/products/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Görsel yüklenemedi.");
                return;
            }

            setCurrentProduct((prev) => ({
                ...prev,
                imageUrl: data.url,
                imagePath: data.path,
            }));
            toast.success("Ürün görseli yüklendi.");
        } catch {
            toast.error("Görsel yüklenirken bağlantı hatası oluştu.");
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setActionLoading(true);

        try {
            const method = currentProduct.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/products", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProduct),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Bir hata oluştu.");
                return;
            }

            toast.success(data.message || "Ürün kaydedildi.");
            await fetchProducts();
            handleCloseModal();
        } catch {
            toast.error("Sunucu bağlantı hatası.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Silme işlemi başarısız.");
                return;
            }

            toast.success("Ürün silindi.");
            await fetchProducts();
        } catch {
            toast.error("Silme işlemi sırasında hata oluştu.");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-12 text-slate-700 shadow-sm">
                <Loader2 size={22} className="animate-spin text-emerald-600" />
                <span className="font-medium">Ürünler yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mağaza Ürünleri</h1>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                        Ürünleri ekleyin, düzenleyin, görsel yükleyin ve mağaza görünümünü yönetin.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <Plus size={18} />
                    Yeni Ürün Ekle
                </button>
            </div>

            {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <AlertCircle size={18} />
                    {error}
                </div>
            ) : null}

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/90 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ürün adı, slug veya kategori ara..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Toplam {products.length} ürün
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[840px] text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                <th className="px-6 py-4">Ürün</th>
                                <th className="px-6 py-4">Slug / Kategori</th>
                                <th className="px-6 py-4">Fiyat</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <Package size={38} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-semibold text-slate-700">Sonuç bulunamadı.</p>
                                        <p className="mt-1 text-sm text-slate-500">Yeni ürün ekleyebilir veya aramayı temizleyebilirsiniz.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <ProductImagePreview src={product.imageUrl} alt={product.name} small />
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-slate-900">{product.name}</div>
                                                    <div className="mt-1 line-clamp-2 max-w-[280px] text-xs leading-5 text-slate-500">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                                                {product.slug}
                                            </div>
                                            <div className="mt-2 text-xs font-medium capitalize text-slate-500">{product.category}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">₺{product.price}</td>
                                        <td className="px-6 py-4">
                                            {product.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Pasif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(product)}
                                                    className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(product.id)}
                                                    className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        {currentProduct.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">Ürün bilgilerini ve mağaza görselini yönetin.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Kapat"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto px-6 py-6">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-800">Ürün Görseli</label>
                                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                    <ProductImagePreview src={currentProduct.imageUrl} alt={currentProduct.name || "Ürün görseli"} />
                                                    <div className="mt-4 flex flex-col gap-2">
                                                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                                                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                                                            {uploadingImage ? "Yükleniyor..." : "Görsel Yükle"}
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={handleImageUpload}
                                                                disabled={uploadingImage}
                                                            />
                                                        </label>
                                                        {currentProduct.imageUrl ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setCurrentProduct((prev) => ({ ...prev, imageUrl: "", imagePath: "" }))}
                                                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                Görseli Kaldır
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <Field label="Ürün Adı *">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={currentProduct.name ?? ""}
                                                        onChange={(event) => setCurrentProduct((prev) => ({ ...prev, name: event.target.value }))}
                                                        className={inputClassName}
                                                        placeholder="Örn: Hukuk Araçları Paketi"
                                                    />
                                                </Field>

                                                <Field label="Slug *">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={currentProduct.slug ?? ""}
                                                        onChange={(event) => setCurrentProduct((prev) => ({ ...prev, slug: event.target.value }))}
                                                        className={`${inputClassName} font-mono`}
                                                        placeholder="legal-toolkit"
                                                    />
                                                </Field>
                                            </div>

                                            <Field label="Açıklama">
                                                <textarea
                                                    rows={4}
                                                    value={currentProduct.description ?? ""}
                                                    onChange={(event) => setCurrentProduct((prev) => ({ ...prev, description: event.target.value }))}
                                                    className={`${inputClassName} resize-none`}
                                                    placeholder="Ürün açıklaması..."
                                                />
                                            </Field>

                                            <div className="grid gap-5 md:grid-cols-2">
                                                <Field label="Kategori *">
                                                    <select
                                                        required
                                                        value={currentProduct.category ?? "general"}
                                                        onChange={(event) => setCurrentProduct((prev) => ({ ...prev, category: event.target.value }))}
                                                        className={inputClassName}
                                                    >
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <Field label="Fiyat (₺) *">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={currentProduct.price ?? 0}
                                                        onChange={(event) =>
                                                            setCurrentProduct((prev) => ({
                                                                ...prev,
                                                                price: Number(event.target.value || 0),
                                                            }))
                                                        }
                                                        className={inputClassName}
                                                    />
                                                </Field>
                                            </div>

                                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(currentProduct.isActive)}
                                                    onChange={(event) => setCurrentProduct((prev) => ({ ...prev, isActive: event.target.checked }))}
                                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-semibold text-slate-800">Ürün mağazada aktif görünsün</span>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    İptal
                                </button>
                                <button
                                    form="productForm"
                                    type="submit"
                                    disabled={actionLoading || uploadingImage}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    Kaydet
                                </button>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
            {children}
        </div>
    );
}

function ProductImagePreview({
    src,
    alt,
    small = false,
}: {
    src?: string | null;
    alt: string;
    small?: boolean;
}) {
    if (src) {
        return (
            <div
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${
                    small ? "h-16 w-16" : "aspect-[4/3] w-full"
                }`}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={small ? 64 : 800}
                    height={small ? 64 : 600}
                    unoptimized
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 ${
                small ? "h-16 w-16" : "aspect-[4/3] w-full"
            }`}
        >
            {small ? <Package size={18} /> : <Upload size={28} />}
        </div>
    );
}
