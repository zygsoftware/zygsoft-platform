"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Mail,
    Zap,
    Clock,
    TrendingUp,
    CreditCard,
    UserPlus,
    Percent,
    BarChart3,
    Filter,
    Loader2,
    Wrench,
    ArrowRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { AdminPageHeader, AdminCard, AdminStatsCard } from "@/components/admin";
import Link from "next/link";

type AnalyticsData = {
    days: number;
    kpis: {
        totalUsers: number;
        emailVerifiedUsers: number;
        activeTrialUsers: number;
        expiredTrialUsers: number;
        trialConvertedUsers: number;
        conversionRate: number;
        activeSubscriptions: number;
        newUsersThisMonth: number;
    };
    funnel: {
        registered: number;
        emailVerified: number;
        trialStarted: number;
        trialUsed: number;
        purchased: number;
    };
    dailySignups: { date: string; count: number }[];
    dailyTrialStarts: { date: string; count: number }[];
    dailyConversions: { date: string; count: number }[];
    mostUsedTools: { toolSlug: string; count: number }[];
    toolUsageByDay: { date: string; toolSlug: string; count: number }[];
    mostActiveUsers: { userId: string; name: string | null; email: string | null; toolUsageCount: number }[];
    recentTrialStarts: { userId: string; name: string | null; email: string | null; trialStartedAt: string }[];
    recentConversions: { userId: string; name: string | null; email: string | null; convertedAt: string }[];
};

const TOOL_LABELS: Record<string, string> = {
    "doc-to-udf": "DOCX→UDF",
    "pdf-merge": "PDF Birleştir",
    "pdf-split": "PDF Böl",
    "image-to-pdf": "Görsel→PDF",
    "pdf-to-image": "PDF→Görsel",
    "tiff-to-pdf": "TIFF→PDF",
    "ocr-text": "OCR Metin",
    "batch-convert": "Toplu Dönüştür",
};

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export default function AdminAnalyticsPage() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/analytics?days=${days}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.error) throw new Error(d.error);
                setData(d);
            })
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [days]);

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-[#e6c800]" />
            </div>
        );
    }

    const kpis = data?.kpis ?? {
        totalUsers: 0,
        emailVerifiedUsers: 0,
        activeTrialUsers: 0,
        expiredTrialUsers: 0,
        trialConvertedUsers: 0,
        conversionRate: 0,
        activeSubscriptions: 0,
        newUsersThisMonth: 0,
    };

    const funnel = data?.funnel ?? {
        registered: 0,
        emailVerified: 0,
        trialStarted: 0,
        trialUsed: 0,
        purchased: 0,
    };

    const funnelSteps = [
        { label: "Kayıt olan", value: funnel.registered, color: "#94a3b8" },
        { label: "Email doğrulayan", value: funnel.emailVerified, color: "#60a5fa" },
        { label: "Demo başlatan", value: funnel.trialStarted, color: "#34d399" },
        { label: "Demo kullanan", value: funnel.trialUsed, color: "#a78bfa" },
        { label: "Satın alan", value: funnel.purchased, color: "#e6c800" },
    ];

    const chartColor = "#e6c800";

    return (
        <div className="space-y-8 max-w-[1600px]">
            <AdminPageHeader
                title="Analitik"
                subtitle="SaaS büyüme ve trial dönüşüm performansı."
                actions={
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30"
                        >
                            <option value={7}>Son 7 gün</option>
                            <option value={30}>Son 30 gün</option>
                            <option value={90}>Son 90 gün</option>
                        </select>
                    </div>
                }
            />

            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-[#e6c800]" />
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                <AdminStatsCard label="Toplam Kullanıcı" value={kpis.totalUsers} icon={<Users size={20} />} accent="slate" />
                <AdminStatsCard label="Email Doğrulanmış" value={kpis.emailVerifiedUsers} icon={<Mail size={20} />} accent="slate" />
                <AdminStatsCard label="Aktif Trial" value={kpis.activeTrialUsers} icon={<Zap size={20} />} accent="emerald" />
                <AdminStatsCard label="Süresi Dolmuş Trial" value={kpis.expiredTrialUsers} icon={<Clock size={20} />} accent="amber" />
                <AdminStatsCard label="Trial→Paid" value={kpis.trialConvertedUsers} icon={<TrendingUp size={20} />} accent="gold" />
                <AdminStatsCard label="Dönüşüm Oranı" value={`%${kpis.conversionRate}`} icon={<Percent size={20} />} accent="gold" />
                <AdminStatsCard label="Aktif Abonelik" value={kpis.activeSubscriptions} icon={<CreditCard size={20} />} accent="emerald" />
                <AdminStatsCard label="Bu Ay Yeni" value={kpis.newUsersThisMonth} icon={<UserPlus size={20} />} accent="violet" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdminCard padding="lg" className="min-h-[340px] flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 shrink-0">
                        <BarChart3 size={18} className="text-[#e6c800]" />
                        Günlük kayıtlar ({days} gün)
                    </h3>
                    <div className="flex-1 min-h-[280px] w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data?.dailySignups ?? []}>
                                <defs>
                                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                                <YAxis fontSize={11} />
                                <Tooltip labelFormatter={(label) => (typeof label === "string" ? formatDate(label) : String(label))} />
                                <Area type="monotone" dataKey="count" stroke={chartColor} fill="url(#signupGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>

                <AdminCard padding="lg" className="min-h-[340px] flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 shrink-0">
                        <Zap size={18} className="text-[#e6c800]" />
                        Günlük demo başlatılan ({days} gün)
                    </h3>
                    <div className="flex-1 min-h-[280px] w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data?.dailyTrialStarts ?? []}>
                                <defs>
                                    <linearGradient id="trialGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                                <YAxis fontSize={11} />
                                <Tooltip labelFormatter={(label) => (typeof label === "string" ? formatDate(label) : String(label))} />
                                <Area type="monotone" dataKey="count" stroke="#34d399" fill="url(#trialGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>

                <AdminCard padding="lg" className="min-h-[340px] flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 shrink-0">
                        <TrendingUp size={18} className="text-[#e6c800]" />
                        Trial→Paid dönüşümler ({days} gün)
                    </h3>
                    <div className="flex-1 min-h-[280px] w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data?.dailyConversions ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                                <YAxis fontSize={11} />
                                <Tooltip labelFormatter={(label) => (typeof label === "string" ? formatDate(label) : String(label))} />
                                <Bar dataKey="count" fill={chartColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>

                <AdminCard padding="lg" className="min-h-[340px] flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 shrink-0">
                        <Wrench size={18} className="text-[#e6c800]" />
                        En çok kullanılan araçlar
                    </h3>
                    <div className="flex-1 min-h-[280px] w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={(data?.mostUsedTools ?? []).slice(0, 8).map((t) => ({
                                    name: TOOL_LABELS[t.toolSlug] ?? t.toolSlug,
                                    count: t.count,
                                }))}
                                layout="vertical"
                                margin={{ left: 20, right: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" fontSize={11} />
                                <YAxis type="category" dataKey="name" width={100} fontSize={11} />
                                <Tooltip />
                                <Bar dataKey="count" fill={chartColor} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AdminCard>
            </div>

            {/* Tool usage trend - aggregate by day */}
            <AdminCard padding="lg" className="min-h-[340px] flex flex-col">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 shrink-0">
                    <BarChart3 size={18} className="text-[#e6c800]" />
                    Araç kullanım trendi (günlük toplam)
                </h3>
                <div className="flex-1 min-h-[280px] w-full">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart
                            data={(() => {
                                const byDay: Record<string, number> = {};
                                for (const { date, count } of data?.toolUsageByDay ?? []) {
                                    byDay[date] = (byDay[date] ?? 0) + count;
                                }
                                return Object.entries(byDay)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([date, count]) => ({ date, count }));
                            })()}
                        >
                            <defs>
                                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip labelFormatter={(label) => (typeof label === "string" ? formatDate(label) : String(label))} />
                            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#usageGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </AdminCard>

            {/* Funnel */}
            <AdminCard padding="lg" className="min-h-[200px]">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ArrowRight size={18} className="text-[#e6c800]" />
                    Dönüşüm hunisi
                </h3>
                <div className="flex flex-wrap items-end gap-2">
                    {funnelSteps.map((step, i) => (
                        <div key={step.label} className="flex flex-col items-center gap-1">
                            <div
                                className="h-24 min-w-[80px] rounded-t-lg flex items-end justify-center pb-2 transition-all"
                                style={{
                                    width: `${Math.max(60, (step.value / (funnel.registered || 1)) * 200)}px`,
                                    background: `linear-gradient(to top, ${step.color}40, ${step.color}20)`,
                                    borderTop: `3px solid ${step.color}`,
                                }}
                            >
                                <span className="text-2xl font-bold text-slate-900">{step.value}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-600 text-center max-w-[100px]">{step.label}</span>
                        </div>
                    ))}
                </div>
            </AdminCard>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdminCard padding="lg">
                    <h3 className="text-base font-bold text-slate-900 mb-4">En aktif kullanıcılar</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-600">Kullanıcı</th>
                                    <th className="text-right py-2 font-semibold text-slate-600">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.mostActiveUsers ?? []).slice(0, 8).map((u) => (
                                    <tr key={u.userId} className="border-b border-slate-100">
                                        <td className="py-2">
                                            <Link href={`/admin/users/${u.userId}`} className="text-slate-900 hover:text-[#e6c800] font-medium">
                                                {u.name || u.email || "—"}
                                            </Link>
                                        </td>
                                        <td className="py-2 text-right font-semibold">{u.toolUsageCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(data?.mostActiveUsers ?? []).length === 0 && (
                            <p className="py-8 text-center text-slate-500 text-sm">Veri yok</p>
                        )}
                    </div>
                </AdminCard>

                <AdminCard padding="lg">
                    <h3 className="text-base font-bold text-slate-900 mb-4">En çok kullanılan araçlar</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-600">Araç</th>
                                    <th className="text-right py-2 font-semibold text-slate-600">Kullanım</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.mostUsedTools ?? []).slice(0, 8).map((t) => (
                                    <tr key={t.toolSlug} className="border-b border-slate-100">
                                        <td className="py-2 font-medium">{TOOL_LABELS[t.toolSlug] ?? t.toolSlug}</td>
                                        <td className="py-2 text-right font-semibold">{t.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(data?.mostUsedTools ?? []).length === 0 && (
                            <p className="py-8 text-center text-slate-500 text-sm">Veri yok</p>
                        )}
                    </div>
                </AdminCard>

                <AdminCard padding="lg">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Son demo başlatılanlar</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-600">Kullanıcı</th>
                                    <th className="text-right py-2 font-semibold text-slate-600">Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.recentTrialStarts ?? []).map((u) => (
                                    <tr key={u.userId} className="border-b border-slate-100">
                                        <td className="py-2">
                                            <Link href={`/admin/users/${u.userId}`} className="text-slate-900 hover:text-[#e6c800] font-medium">
                                                {u.name || u.email || "—"}
                                            </Link>
                                        </td>
                                        <td className="py-2 text-right text-slate-500">
                                            {new Date(u.trialStartedAt).toLocaleDateString("tr-TR")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(data?.recentTrialStarts ?? []).length === 0 && (
                            <p className="py-8 text-center text-slate-500 text-sm">Veri yok</p>
                        )}
                    </div>
                </AdminCard>

                <AdminCard padding="lg">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Son dönüşümler</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-semibold text-slate-600">Kullanıcı</th>
                                    <th className="text-right py-2 font-semibold text-slate-600">Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.recentConversions ?? []).map((u) => (
                                    <tr key={u.userId} className="border-b border-slate-100">
                                        <td className="py-2">
                                            <Link href={`/admin/users/${u.userId}`} className="text-slate-900 hover:text-[#e6c800] font-medium">
                                                {u.name || u.email || "—"}
                                            </Link>
                                        </td>
                                        <td className="py-2 text-right text-slate-500">
                                            {new Date(u.convertedAt).toLocaleDateString("tr-TR")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(data?.recentConversions ?? []).length === 0 && (
                            <p className="py-8 text-center text-slate-500 text-sm">Veri yok</p>
                        )}
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}
