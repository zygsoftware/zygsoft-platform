"use client";

import { ReactNode } from "react";
import Link from "next/link";

type AdminStatsCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  href?: string;
  accent?: "default" | "gold" | "emerald" | "violet" | "slate" | "amber";
};

const accentMap = {
  default: "bg-slate-100 text-slate-600 border-slate-200/60",
  gold: "bg-[#e6c800]/15 text-[#b89600] border-[#e6c800]/25",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  violet: "bg-violet-50 text-violet-700 border-violet-200/60",
  slate: "bg-slate-100 text-slate-600 border-slate-200/60",
  amber: "bg-amber-50 text-amber-700 border-amber-200/60",
};

export function AdminStatsCard({ label, value, subtext, icon, href, accent = "default" }: AdminStatsCardProps) {
  const content = (
    <div className="flex flex-col justify-between p-5 min-h-[110px] rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-200 group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${accentMap[accent]} group-hover:scale-[1.02] transition-transform duration-200`}
      >
        {icon}
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 whitespace-normal leading-tight">{label}</p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5 whitespace-normal leading-tight">{subtext}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
