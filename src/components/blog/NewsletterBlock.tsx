"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { usePrefillUserFields } from "@/hooks/usePrefillUserFields";

type NewsletterBlockProps = {
    locale: string;
    variant?: "default" | "inline";
};

export function NewsletterBlock({ locale, variant = "default" }: NewsletterBlockProps) {
    const isTr = locale === "tr";
    const [form, onChange, reset] = usePrefillUserFields({ email: "" }, ["email"]);
    const email = form.email ?? "";
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("loading");
        setError("");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || (isTr ? "Bir hata oluştu." : "An error occurred."));
                setStatus("error");
                return;
            }
            reset();
            setStatus("success");
        } catch {
            setError(isTr ? "Bir hata oluştu." : "An error occurred.");
            setStatus("error");
        }
    };

    const isInline = variant === "inline";

    return (
        <div className={isInline ? "p-5 bg-slate-50 rounded-xl border border-slate-100" : "p-8 bg-[#0a0c10] rounded-2xl border border-[#0a0c10] relative overflow-hidden"}>
            {!isInline && <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />}
            <div className="relative z-10">
                <div className={`flex items-center gap-3 ${isInline ? "mb-3" : "mb-4"}`}>
                    <div className={`rounded-xl flex items-center justify-center shrink-0 ${isInline ? "w-10 h-10 bg-[#e6c800]/15" : "w-12 h-12 bg-[#e6c800]/20"}`}>
                        <Mail size={isInline ? 20 : 24} className={isInline ? "text-[#e6c800]" : "text-[#e6c800]"} />
                    </div>
                    <div>
                        <h3 className={`font-display font-bold ${isInline ? "text-[#0e0e0e] text-base" : "text-white text-lg"}`}>
                            {isTr ? "Gelişmelerden Haberdar Olun" : "Stay Updated"}
                        </h3>
                        <p className={isInline ? "text-slate-500 text-sm" : "text-white/60 text-sm"}>
                            {isTr ? "Yeni yazılar ve güncellemeler e-posta ile gelsin." : "Get new posts and updates by email."}
                        </p>
                    </div>
                </div>
                {status === "success" ? (
                    <div className={`flex items-center gap-2 text-sm font-medium ${isInline ? "text-emerald-600" : "text-emerald-400"}`}>
                        <Check size={18} />
                        {isTr ? "Abone oldunuz. Teşekkürler!" : "Subscribed. Thank you!"}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => onChange("email", e.target.value)}
                            placeholder={isTr ? "E-posta adresiniz" : "Your email"}
                            className={`flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#e6c800] focus:border-[#e6c800] ${isInline ? "bg-white border border-slate-200 text-[#0a0c10] placeholder:text-slate-400" : "bg-white/10 border border-white/20 text-white placeholder:text-white/50"}`}
                            disabled={status === "loading"}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className={`px-6 py-3 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 ${isInline ? "bg-[#e6c800] text-[#0a0c10] hover:bg-[#d4b800]" : "bg-[#e6c800] text-[#0a0c10] hover:bg-white"}`}
                        >
                            {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : (isTr ? "Abone Ol" : "Subscribe")}
                        </button>
                    </form>
                )}
                {error && <p className={isInline ? "text-red-600 text-sm mt-2" : "text-red-400 text-sm mt-2"}>{error}</p>}
            </div>
        </div>
    );
}
