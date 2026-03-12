"use client";

import { motion } from "framer-motion";

type AuthFormPanelProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg";
};

const maxWidthClass = {
  sm: "max-w-[380px]",
  md: "max-w-[420px]",
  lg: "max-w-[480px]",
};

export function AuthFormPanel({ children, className = "", maxWidth = "md" }: AuthFormPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-full ${maxWidthClass[maxWidth]} ${className}`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
        {children}
      </div>
    </motion.div>
  );
}
