"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, FileText, Zap } from "lucide-react";
import { createRevealUp, revealViewport } from "@/components/ui/motion";

type VisualBlockProps = {
  variant?: "dashboard" | "documents" | "analytics";
};

export function VisualBlock({ variant = "dashboard" }: VisualBlockProps) {
  const reducedMotion = !!useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl border border-[#343131]/[0.06] bg-gradient-to-br from-[#fafafc] to-white overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.06)]"
      variants={createRevealUp(reducedMotion, 40, 8)}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="h-12 bg-[#343131]/[0.02] border-b border-[#343131]/[0.06] flex items-center px-5 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#343131]/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#343131]/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#343131]/20" />
        </div>
        <span className="text-[11px] font-bold text-[#343131]/50 ml-2">
          {variant === "dashboard" && "ZYGSOFT Dashboard"}
          {variant === "documents" && "Belge İş Akışı"}
          {variant === "analytics" && "Performans Analizi"}
        </span>
      </div>
      <div className="p-6 md:p-8">
        {variant === "dashboard" && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Aktif Projeler", value: "12", icon: FileText },
              { label: "Dönüşüm", value: "94%", icon: Zap },
              { label: "ROI", value: "3.2×", icon: BarChart3 },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="p-4 rounded-xl bg-white border border-[#343131]/[0.06] shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={revealViewport}
                  transition={{ delay: i * 0.1 }}
                >
                  <Icon size={20} className="text-[#e6c800] mb-2" />
                  <p className="text-2xl font-black text-[#343131]">{item.value}</p>
                  <p className="text-[12px] font-medium text-[#343131]/55">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        )}
        {variant === "documents" && (
          <div className="flex gap-4 items-center justify-center py-4">
            <div className="w-16 h-20 rounded-lg bg-[#343131]/[0.06] flex items-center justify-center">
              <FileText size={24} className="text-[#343131]/40" />
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#e6c800]"
            >
              <Zap size={24} />
            </motion.div>
            <div className="w-16 h-20 rounded-lg bg-[#e6c800]/10 border border-[#e6c800]/20 flex items-center justify-center">
              <FileText size={24} className="text-[#e6c800]" />
            </div>
          </div>
        )}
        {variant === "analytics" && (
          <div className="space-y-4">
            {[78, 92, 65, 88].map((val, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] font-bold text-[#343131]/60 mb-1">
                  <span>Metric {i + 1}</span>
                  <span>{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#343131]/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#e6c800] to-[#e6c800]/70"
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${val}%` }}
                    viewport={revealViewport}
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
