"use client";

import { useId, useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  forgotLink?: string;
  strength?: React.ReactNode;
  id?: string;
};

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, forgotLink, strength, id, className = "", ...props }, ref) => {
    const t = useTranslations("Auth.shared");
    const [show, setShow] = useState(false);
    const generatedId = useId();
    const inputId = id ?? `auth-password-${generatedId}`;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#e6c800] transition-colors"
          >
            {label}
          </label>
          {forgotLink && (
            <a
              href={forgotLink}
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#e6c800] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800]/50 focus-visible:ring-offset-2 rounded"
            >
              {t("forgotPassword")}
            </a>
          )}
        </div>
        <div className="relative group">
          <input
            ref={ref}
            id={inputId}
            type={show ? "text" : "password"}
            className={`
              w-full h-[52px] pl-4 pr-[52px] text-[15px] font-medium text-slate-950 placeholder:text-slate-400
              bg-white border border-slate-200 rounded-xl
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]
              hover:border-slate-300
              disabled:opacity-60 disabled:cursor-not-allowed
              ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
              ${className}
            `}
            aria-describedby={error ? `${inputId}-error` : strength ? `${inputId}-strength` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800]/50 focus-visible:text-[#e6c800]"
            aria-label={show ? t("hidePassword") : t("showPassword")}
            tabIndex={0}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {strength && <div id={`${inputId}-strength`}>{strength}</div>}
        {error && (
          <p id={`${inputId}-error`} className="text-red-600 text-[13px] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
