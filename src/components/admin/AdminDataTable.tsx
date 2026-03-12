"use client";

import { ReactNode } from "react";

type AdminDataTableProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AdminDataTable({ children, footer, className = "" }: AdminDataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="admin-table w-full text-left">
        {children}
      </table>
      {footer && (
        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-slate-50/30">
          {footer}
        </div>
      )}
    </div>
  );
}
