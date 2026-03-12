"use client";

import { forwardRef } from "react";

const ICON_SLOT = 40; // w-10 = 40px
const INPUT_PADDING_LEFT = 48; // pl-12 = 48px

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  id?: string;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, id, className = "", ...props }, ref) => {
    const inputId = id ?? `auth-input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#e6c800] transition-colors"
        >
          {label}
        </label>
        <div className="relative group">
          {icon && (
            <div
              className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-slate-400 group-focus-within:text-[#e6c800] transition-colors pointer-events-none shrink-0"
              aria-hidden
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-[52px] text-[15px] font-medium text-slate-950 placeholder:text-slate-400
              bg-white border border-slate-200 rounded-xl
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800]
              hover:border-slate-300
              disabled:opacity-60 disabled:cursor-not-allowed
              pr-4
              ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
              ${className}
            `}
            style={icon ? { paddingLeft: INPUT_PADDING_LEFT } : { paddingLeft: 16 }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-red-600 text-[13px] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
