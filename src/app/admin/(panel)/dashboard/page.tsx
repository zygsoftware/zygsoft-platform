import { prisma } from "@/lib/prisma";
import { FolderKanban, Network, Users, BookOpen, TrendingUp, Clock, Activity, Package, Receipt } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const [projectCount, apiCount, userCount, blogCount, publishedBlogCount, productCount, paymentCount, pendingPaymentCount] = await Promise.all([
        prisma.project.count(),
        prisma.apiConnection.count(),
        prisma.user.count(),
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.product.count(),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: "pending" } }),
    ]);

    const recentPosts = await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, published: true, author: true, createdAt: true },
    });

    const stats = [
        { name: "Toplam Proje", value: projectCount, icon: FolderKanban, color: "blue", href: "/admin/projects" },
        { name: "Blog Yazısı", value: blogCount, subtext: `${publishedBlogCount} yayında`, icon: BookOpen, color: "violet", href: "/admin/blog" },
        { name: "Mağaza Ürünü", value: productCount, icon: Package, color: "cyan", href: "/admin/products" },
        { name: "Ödeme", value: paymentCount, subtext: pendingPaymentCount > 0 ? `${pendingPaymentCount} bekleyen` : undefined, icon: Receipt, color: "emerald", href: "/admin/payments" },
        { name: "API Bağlantısı", value: apiCount, icon: Network, color: "cyan", href: "/admin/apis" },
        { name: "Yönetici", value: userCount, icon: Users, color: "emerald", href: "/admin/users" },
    ];

    const colorMap: Record<string, string> = {
        blue: "bg-zinc-800 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-300",
        violet: "bg-emerald-900/30 text-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-400",
        cyan: "bg-emerald-900/20 text-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300",
        emerald: "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white",
    };

    return (
        <div>
            {/* Welcome */}
            <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-[#0e0e0e]">Hoş Geldiniz 👋</h1>
                <p className="text-[#666] text-lg mt-2">Zygsoft yönetim paneline genel bakış.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.name}
                            href={stat.href}
                            className="group glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover-glow relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                                    <Icon size={20} />
                                </div>
                                <TrendingUp size={16} className="text-[#888] group-hover:text-[#e6c800] transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-[#0e0e0e] mb-1 relative z-10">
                                {stat.value}
                            </div>
                            <div className="text-sm font-semibold text-[#666] relative z-10">{stat.name}</div>
                            {stat.subtext && (
                                <div className="text-xs text-[#888] mt-1 relative z-10">{stat.subtext}</div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Blog Posts */}
                <div className="glass rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#0e0e0e] flex items-center gap-2">
                            <BookOpen size={18} className="text-[#e6c800]" />
                            Son Blog Yazıları
                        </h2>
                        <Link href="/admin/blog" className="text-sm font-semibold text-[#888] hover:text-[#0e0e0e] transition-colors">
                            Tümünü Gör →
                        </Link>
                    </div>
                    {recentPosts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[#888] font-medium text-sm">Henüz blog yazısı yok.</p>
                            <Link href="/admin/blog" className="mt-3 inline-block font-bold text-sm text-[#0e0e0e] hover:text-[#e6c800] border-b border-[#e6c800]">
                                İlk Yazıyı Ekle
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentPosts.map((post) => (
                                <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 transition-colors group border border-transparent hover:border-black/5">
                                    <div className="w-10 h-10 rounded-xl bg-[#0e0e0e] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        <BookOpen size={16} className="text-[#e6c800]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#0e0e0e] truncate">{post.title}</p>
                                        <p className="text-xs font-medium text-[#888] flex items-center gap-1.5 mt-1">
                                            <Clock size={12} />
                                            {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${post.published
                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                        : "bg-black/5 text-[#555] border border-black/10"
                                        }`}>
                                        {post.published ? "Yayında" : "Taslak"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-2xl p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#0e0e0e] flex items-center gap-2 mb-6">
                            <Activity size={18} className="text-[#e6c800]" />
                            Hızlı İşlemler
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { href: "/admin/blog", label: "Yeni Blog Yazısı", icon: "✍️" },
                                { href: "/admin/projects", label: "Yeni Proje", icon: "📁" },
                                { href: "/admin/apis", label: "API Ekle", icon: "🔌" },
                                { href: "/admin/users", label: "Kullanıcı Ekle", icon: "👤" },
                            ].map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-black/5 bg-white/40 hover:bg-white hover:shadow-md transition-all text-center group"
                                >
                                    <span className="text-3xl group-hover:scale-110 group-hover:-rotate-6 transition-transform">{action.icon}</span>
                                    <span className="text-xs font-bold text-[#555] group-hover:text-[#0e0e0e]">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-5 bg-[#e6c800]/10 border border-[#e6c800]/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6c800]/20 blur-xl rounded-full -mr-10 -mt-10" />
                        <p className="text-sm font-bold text-[#0e0e0e] mb-2 flex items-center gap-2">💡 İpucu</p>
                        <p className="text-sm font-medium text-[#666] leading-relaxed relative z-10">
                            Blog yazılarınızı taslak olarak kaydedip, hazır olduğunuzda yayınlayabilirsiniz. Böylece içeriklerinizi yayın öncesi son kez gözden geçirme fırsatı bulursunuz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
