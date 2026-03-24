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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-200 transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight break-words">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:shrink-0">{actions}</div>}
    </div>
  );
}
