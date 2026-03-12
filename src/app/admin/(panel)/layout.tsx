import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[var(--bg-2)]">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ZYGSOFT</p>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Yönetim Paneli</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0e0e0e] flex items-center justify-center text-[#e6c800] text-xs font-bold">
                            Z
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-40" style={{ background: "radial-gradient(circle, rgba(230,200,0,0.15) 0%, transparent 70%)" }} />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
