"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";

type AdminFilterBarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  sort?: ReactNode;
  onClearFilters?: () => void;
  showClear?: boolean;
  className?: string;
};

export function AdminFilterBar({
  searchPlaceholder = "Ara...",
  searchValue = "",
  onSearchChange,
  filters,
  sort,
  onClearFilters,
  showClear = false,
  className = "",
}: AdminFilterBarProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]/50 transition-all"
            />
          </div>
        )}
        {sort && <div className="shrink-0">{sort}</div>}
      </div>
      {(filters || (showClear && onClearFilters)) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {showClear && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}
