"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type LinkItem = {
  href: string;
  label: React.ReactNode;
};

type AuthActionsProps = {
  submitLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  footerLinks?: LinkItem[];
  className?: string;
};

export function AuthActions({
  submitLabel,
  loading = false,
  disabled = false,
  footerLinks = [],
  className = "",
}: AuthActionsProps) {
  return (
    <div className={className}>
      {submitLabel && (
        <motion.button
          type="submit"
          disabled={disabled || loading}
          whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
          className="w-full h-[52px] bg-[#0a0c10] text-white font-bold text-sm rounded-xl hover:bg-[#e6c800] hover:text-[#0a0c10] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2"
          aria-busy={loading}
          aria-disabled={disabled || loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 motion-reduce:animate-none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {submitLabel}
            </>
          ) : (
            submitLabel
          )}
        </motion.button>
      )}
      {footerLinks.length > 0 && (
        <div className={`flex flex-col gap-3 text-center ${submitLabel ? "mt-8 pt-8 border-t border-slate-200" : ""}`}>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold text-slate-600 hover:text-[#0a0c10] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800]/50 focus-visible:ring-offset-2 rounded [&_.accent]:text-[#e6c800] [&_.accent]:hover:text-[#c9ad00]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
