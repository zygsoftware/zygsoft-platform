"use client";

type AdminBadgeVariant =
  | "active"
  | "suspended"
  | "pending"
  | "published"
  | "draft"
  | "approved"
  | "rejected"
  | "open"
  | "in_progress"
  | "answered"
  | "closed"
  | "featured"
  | "default";

const variantStyles: Record<AdminBadgeVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  suspended: "bg-red-50 text-red-700 border-red-200/60",
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  draft: "bg-slate-100 text-slate-600 border-slate-200/60",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  rejected: "bg-red-50 text-red-700 border-red-200/60",
  open: "bg-blue-50 text-blue-700 border-blue-200/60",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200/60",
  answered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  closed: "bg-slate-100 text-slate-500 border-slate-200/60",
  featured: "bg-violet-50 text-violet-700 border-violet-200/60",
  default: "bg-slate-100 text-slate-600 border-slate-200/60",
};

const variantLabels: Record<AdminBadgeVariant, string> = {
  active: "Aktif",
  suspended: "Askıda",
  pending: "Beklemede",
  published: "Yayında",
  draft: "Taslak",
  approved: "Onaylı",
  rejected: "Reddedildi",
  open: "Açık",
  in_progress: "İnceleniyor",
  answered: "Yanıtlandı",
  closed: "Kapalı",
  featured: "Öne Çıkan",
  default: "—",
};

type AdminBadgeProps = {
  variant: AdminBadgeVariant;
  label?: string;
  className?: string;
};

export function AdminBadge({ variant, label, className = "" }: AdminBadgeProps) {
  const style = variantStyles[variant] ?? variantStyles.default;
  const text = label ?? variantLabels[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border transition-colors ${style} ${className}`}
    >
      {text}
    </span>
  );
}
