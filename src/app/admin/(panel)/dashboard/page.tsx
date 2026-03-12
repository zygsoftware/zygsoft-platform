import { prisma } from "@/lib/prisma";
import { FolderKanban, Network, Users, BookOpen, Clock, Activity, Package, Receipt, MessageSquare, Eye, Heart } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader, AdminStatsCard, AdminCard, AdminEmptyState, AdminBadge } from "@/components/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const [
        projectCount,
        apiCount,
        userCount,
        activeUserCount,
        suspendedUserCount,
        blogCount,
        publishedBlogCount,
        draftBlogCount,
        commentsPendingCount,
        blogViewsSum,
        blogLikesCount,
        productCount,
        paymentCount,
        pendingPaymentCount,
    ] = await Promise.all([
        prisma.project.count(),
        prisma.apiConnection.count(),
        prisma.user.count(),
        prisma.user.count({ where: { status: "active" } }),
        prisma.user.count({ where: { status: "suspended" } }),
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.blogPost.count({ where: { published: false } }),
        prisma.blogComment.count({ where: { status: "pending" } }),
        prisma.blogPost.aggregate({ _sum: { view_count: true } }).then((r) => r._sum.view_count ?? 0),
        prisma.blogLike.count(),
        prisma.product.count(),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: "pending" } }),
    ]);

    const [recentPosts, recentComments] = await Promise.all([
        prisma.blogPost.findMany({
            orderBy: { created_at: "desc" },
            take: 5,
            select: { id: true, title_tr: true, title_en: true, published: true, author: true, created_at: true },
        }),
        prisma.blogComment.findMany({
            where: { status: "pending" },
            take: 5,
            orderBy: { created_at: "desc" },
            include: { post: { select: { title_tr: true, slug: true } } },
        }),
    ]);

    return (
        <div className="space-y-8">
            <AdminPageHeader
                title="Hoş Geldiniz"
                subtitle="Zygsoft yönetim paneline genel bakış."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                <AdminStatsCard label="Proje" value={projectCount} icon={<FolderKanban size={20} />} accent="slate" href="/admin/projects" />
                <AdminStatsCard label="Blog Yazısı" value={blogCount} subtext={`${publishedBlogCount} yayında · ${draftBlogCount} taslak${commentsPendingCount > 0 ? ` · ${commentsPendingCount} yorum bekliyor` : ""}`} icon={<BookOpen size={20} />} accent="violet" href="/admin/blog" />
                <AdminStatsCard label="Görüntülenme" value={blogViewsSum} icon={<Eye size={20} />} accent="gold" href="/admin/blog" />
                <AdminStatsCard label="Beğeni" value={blogLikesCount} icon={<Heart size={20} />} accent="violet" href="/admin/blog" />
                <AdminStatsCard label="Ürün" value={productCount} icon={<Package size={20} />} accent="slate" href="/admin/products" />
                <AdminStatsCard label="Ödeme" value={paymentCount} subtext={pendingPaymentCount > 0 ? `${pendingPaymentCount} bekleyen` : undefined} icon={<Receipt size={20} />} accent={pendingPaymentCount > 0 ? "amber" : "emerald"} href="/admin/payments" />
                <AdminStatsCard label="API" value={apiCount} icon={<Network size={20} />} accent="slate" href="/admin/apis" />
                <AdminStatsCard label="Kullanıcı" value={userCount} subtext={`${activeUserCount} aktif${suspendedUserCount > 0 ? ` · ${suspendedUserCount} askıda` : ""}`} icon={<Users size={20} />} accent="emerald" href="/admin/users" />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Blog Posts */}
                <AdminCard padding="lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BookOpen size={18} className="text-[#e6c800]" />
                            Son Blog Yazıları
                        </h2>
                        <Link href="/admin/blog" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                            Tümünü Gör →
                        </Link>
                    </div>
                    {recentPosts.length === 0 ? (
                        <AdminEmptyState
                            icon={<BookOpen size={40} />}
                            title="Henüz blog yazısı yok"
                            description="İlk blog yazınızı oluşturarak başlayın."
                            action={
                                <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0e0e0e] text-white font-semibold rounded-xl hover:bg-[#1a1a1a] transition-colors text-sm">
                                    İlk Yazıyı Ekle
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentPosts.map((post) => (
                                <Link key={post.id} href={`/admin/blog/edit/${post.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-[#0e0e0e] flex items-center justify-center shrink-0 group-hover:scale-[1.02] transition-transform">
                                        <BookOpen size={16} className="text-[#e6c800]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{post.title_tr || post.title_en}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                            <Clock size={12} />
                                            {new Date(post.created_at).toLocaleDateString("tr-TR")}
                                        </p>
                                    </div>
                                    <AdminBadge variant={post.published ? "published" : "draft"} />
                                </Link>
                            ))}
                        </div>
                    )}
                </AdminCard>

                {/* Quick Actions */}
                <AdminCard padding="lg">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Activity size={18} className="text-[#e6c800]" />
                        Hızlı İşlemler
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { href: "/admin/blog/new", label: "Yeni Blog Yazısı", icon: "✍️" },
                            { href: "/admin/projects", label: "Yeni Proje", icon: "📁" },
                            { href: "/admin/apis", label: "API Ekle", icon: "🔌" },
                            { href: "/admin/users", label: "Kullanıcı Ekle", icon: "👤" },
                        ].map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all text-center group"
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-[#e6c800]/10 border border-[#e6c800]/20 rounded-xl">
                        <p className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">💡 İpucu</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Blog yazılarınızı taslak olarak kaydedip, hazır olduğunuzda yayınlayabilirsiniz.
                        </p>
                    </div>
                </AdminCard>

                {/* Pending Comments */}
                <AdminCard padding="lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare size={18} className="text-[#e6c800]" />
                            Bekleyen Yorumlar
                            {recentComments.length > 0 && (
                                <AdminBadge variant="pending" label={`${recentComments.length}`} />
                            )}
                        </h2>
                        <Link href="/admin/blog/comments" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                            Tümünü Gör →
                        </Link>
                    </div>
                    {recentComments.length === 0 ? (
                        <AdminEmptyState
                            icon={<MessageSquare size={40} />}
                            title="Bekleyen yorum yok"
                            description="Onay bekleyen blog yorumu bulunmuyor."
                            action={
                                <Link href="/admin/blog/comments" className="text-sm font-semibold text-[#e6c800] hover:text-[#c9ad00] transition-colors">
                                    Yorumları Görüntüle
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentComments.map((c) => (
                                <Link key={c.id} href={`/admin/blog/comments?post=${c.post_id}`} className="block p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <p className="text-sm text-slate-900 line-clamp-2">{c.content}</p>
                                    <p className="text-xs text-slate-500 mt-1">{c.post?.title_tr} · {new Date(c.created_at).toLocaleDateString("tr-TR")}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </AdminCard>
            </div>
        </div>
    );
}
