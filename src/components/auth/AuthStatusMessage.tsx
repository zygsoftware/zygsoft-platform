"use client";

import { motion } from "framer-motion";

type AuthStatusMessageProps = {
  type: "error" | "success";
  children: React.ReactNode;
};

export function AuthStatusMessage({ type, children }: AuthStatusMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: type === "error" ? -8 : 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      role="alert"
      className={`p-4 rounded-xl text-[14px] font-medium ${
        type === "error"
          ? "bg-red-50 border border-red-200 text-red-700"
          : "bg-[#e6c800]/10 border border-[#e6c800]/20 text-slate-950"
      }`}
    >
      {children}
    </motion.div>
  );
}
