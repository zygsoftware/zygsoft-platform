"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, Package, Server, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
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
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        name: "",
        slug: "",
        description: "",
        category: "general",
        price: 0,
        iconType: "blocks",
        isActive: true
    });

    const categories = [
        { id: "hukuk", label: "Hukuk Sistemleri" },
        { id: "seo", label: "SEO Araçları" },
        { id: "web", label: "Web Hizmetleri" },
        { id: "general", label: "Genel" }
    ];

    const iconTypes = [
        { id: "blocks", label: "Bloklar" },
        { id: "server", label: "Sunucu" },
        { id: "shield", label: "Güvenlik Kalkanı" },
        { id: "zap", label: "Hızlı / Şimşek" },
        { id: "file-text", label: "Belge" },
        { id: "layers", label: "Katmanlar" },
        { id: "image", label: "Resim" }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch (error) {
            toast.error("Ürünler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setCurrentProduct(product);
        } else {
            setCurrentProduct({
                name: "",
                slug: "",
                description: "",
                category: "general",
                price: 0,
                iconType: "blocks",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);

        const method = currentProduct.id ? "PUT" : "POST";

        try {
            const res = await fetch("/api/admin/products", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProduct)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Bir hata oluştu.");
            } else {
                toast.success(data.message);
                fetchProducts();
                handleCloseModal();
            }
        } catch (error) {
            toast.error("Sunucu bağlantı hatası.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Silme işlemi başarısız.");
            } else {
                toast.success("Ürün silindi.");
                fetchProducts();
            }
        } catch (error) {
            toast.error("Silme işlemi sırasında hata oluştu.");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Zygsoft App Store Yönetimi</h1>
                    <p className="text-slate-500">SaaS ürünlerinizi ekleyin, düzenleyin ve kategorize edin.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} /> Yeni Ürün Ekle
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Ürün adı veya slug ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Toplam {products.length} Ürün</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-medium">Ürün Adı</th>
                                <th className="px-6 py-4 font-medium">Slug / Kategori</th>
                                <th className="px-6 py-4 font-medium">Fiyat</th>
                                <th className="px-6 py-4 font-medium">Durum</th>
                                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Package className="mx-auto mb-4 text-slate-300" size={32} />
                                        Ürün bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{product.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1 max-w-[250px]">{product.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">{product.slug}</div>
                                            <div className="text-xs text-slate-500 capitalize">{product.category}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            ₺{product.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pasif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
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

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {currentProduct.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                                </h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Ürün Adı *</label>
                                            <input
                                                type="text"
                                                required
                                                value={currentProduct.name}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                placeholder="Örn: Seo Master Pro"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Slug (Bağlantı URL'i) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={currentProduct.slug}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm"
                                                placeholder="orn-seo-master"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                                        <textarea
                                            rows={3}
                                            value={currentProduct.description}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                                            placeholder="Bu ürünün müşteriye sağlayacağı faydalar..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Kategori *</label>
                                            <select
                                                required
                                                value={currentProduct.category}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat (₺) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={currentProduct.price}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Vitrin İkon Tipi</label>
                                            <select
                                                value={currentProduct.iconType}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, iconType: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            >
                                                {iconTypes.map(icon => (
                                                    <option key={icon.id} value={icon.id}>{icon.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center">
                                            <label className="flex items-center gap-3 cursor-pointer mt-6">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={currentProduct.isActive}
                                                        onChange={(e) => setCurrentProduct({ ...currentProduct, isActive: e.target.checked })}
                                                    />
                                                    <div className={`block w-14 h-8 rounded-full transition-colors ${currentProduct.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${currentProduct.isActive ? 'transform translate-x-6' : ''}`}></div>
                                                </div>
                                                <div className="text-sm font-medium text-slate-700">
                                                    Ürün Mağazada Aktif Gösterilsin
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {currentProduct.id && (
                                        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg flex gap-3 text-sm mt-4">
                                            <AlertCircle size={20} className="shrink-0" />
                                            <div>Bu ürünü pasife çektiğinizde, yeni satışlara kapanır ancak mevcut aboneliği olanlar panellerine erişmeye devam edebilirler.</div>
                                        </div>
                                    )}

                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    form="productForm"
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    Kaydet
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
