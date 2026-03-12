"use client";

import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthStatusProps =
  | { type: "error"; children: React.ReactNode }
  | { type: "success"; children: React.ReactNode }
  | { type: "loading"; children?: React.ReactNode };

export function AuthStatus(props: AuthStatusProps) {
  if (props.type === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200"
        role="status"
        aria-live="polite"
      >
        <Loader2 size={20} className="animate-spin motion-reduce:animate-none text-[#e6c800] shrink-0" />
        <span className="text-[14px] font-medium text-slate-700">
          {props.children ?? "İşleniyor..."}
        </span>
      </motion.div>
    );
  }
  if (props.type === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: [0, -4, 4, -4, 4, 0] }}
        transition={{
          opacity: { duration: 0.2 },
          x: { duration: 0.4, ease: "easeOut" },
        }}
        role="alert"
        className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px] font-medium"
      >
        {props.children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      className="p-4 rounded-xl bg-[#e6c800]/10 border border-[#e6c800]/25 text-slate-900 text-[14px] font-medium"
    >
      {props.children}
    </motion.div>
  );
}
