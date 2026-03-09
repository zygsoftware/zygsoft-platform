import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Zygsoft</p>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Yönetim Paneli</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold shadow-sm">
                            GY
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
