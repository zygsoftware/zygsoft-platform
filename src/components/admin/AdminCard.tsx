"use client";

import { ReactNode } from "react";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

export function AdminCard({ children, className = "", padding = "md" }: AdminCardProps) {
  const paddingClass =
    padding === "none" ? "p-0" : padding === "sm" ? "p-4" : padding === "lg" ? "p-8" : "p-6";
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-200 ${paddingClass} ${className}`}
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {children}
    </div>
  );
}
