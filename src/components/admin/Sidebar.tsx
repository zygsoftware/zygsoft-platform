"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Network, LogOut, BookOpen, Users, ChevronRight, Receipt, Package, MessageSquare, LifeBuoy, BarChart3 } from "lucide-react";
import { signOut } from "next-auth/react";

const navGroups = [
    {
        label: "Genel",
        items: [
            { href: "/admin/dashboard", label: "Gösterge Paneli", icon: LayoutDashboard },
            { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        ],
    },
    {
        label: "İçerik",
        items: [
            { href: "/admin/products", label: "Mağaza Ürünleri", icon: Package },
            { href: "/admin/blog", label: "Blog Yazıları", icon: BookOpen },
            { href: "/admin/projects", label: "Projeler", icon: FolderKanban },
            { href: "/admin/payments", label: "Ödemeler", icon: Receipt },
        ],
    },
    {
        label: "Müşteri",
        items: [
            { href: "/admin/contacts", label: "İletişim Talepleri", icon: MessageSquare },
            { href: "/admin/support",  label: "Destek Talepleri",   icon: LifeBuoy },
        ],
    },
    {
        label: "Sistem",
        items: [
            { href: "/admin/apis", label: "API Bağlantıları", icon: Network },
            { href: "/admin/users", label: "Kullanıcılar", icon: Users },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white/60 backdrop-blur-2xl flex flex-col h-screen fixed border-r border-slate-200/60 z-20">
            {/* Logo */}
            <div className="px-6 py-8 border-b border-slate-200/60">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    <img
                        src="/brand/logo-icon.svg"
                        alt="ZYGSOFT"
                        className="w-10 h-10 shrink-0"
                        width={40}
                        height={40}
                    />
                    <div>
                        <span className="text-sm font-bold text-slate-900 block tracking-tight">Zygsoft</span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Admin Panel</span>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="px-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                            ? "bg-[#0e0e0e] text-white shadow-lg"
                                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? "text-[#e6c800]" : "text-slate-400 group-hover:text-slate-600 transition-colors"} />
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && <ChevronRight size={14} className="text-[#e6c800]" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-6 border-t border-slate-200/60 space-y-2 bg-slate-50/50">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-200/50 transition-all"
                >
                    <span className="text-lg">🌐</span>
                    <span>Siteyi Görüntüle</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 transition-all"
                >
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
}
