"use client";

import { ReactNode } from "react";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AdminFormSection({ title, description, children, className = "" }: AdminFormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
