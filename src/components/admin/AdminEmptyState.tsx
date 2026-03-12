"use client";

import { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function AdminEmptyState({ icon, title, description, action, className = "" }: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-[#e6c800]/10 flex items-center justify-center mb-6 text-[#e6c800]">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
