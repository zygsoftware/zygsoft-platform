"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, subtitle, backHref, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-200 transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
