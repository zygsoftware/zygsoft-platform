"use client";

import { User } from "lucide-react";

type AuthorBoxProps = {
    author: string;
    locale: string;
};

export function AuthorBox({ author, locale }: AuthorBoxProps) {
    const isTr = locale === "tr";
    return (
        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-[#e6c800]/20 flex items-center justify-center text-[#0a0c10] shrink-0">
                <User size={28} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {isTr ? "Yazar" : "Author"}
                </p>
                <p className="font-bold text-[#0e0e0e]">{author}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                    {isTr ? "ZYGSOFT ekibi" : "ZYGSOFT team"}
                </p>
            </div>
        </div>
    );
}
