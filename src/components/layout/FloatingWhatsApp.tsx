"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
    const phoneNumber = "905551234567"; // Customize this number
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group flex items-center justify-center"
            >
                {/* Ping Animation Layer */}
                <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-60 pointer-events-none" />

                {/* Primary Button */}
                <div className="relative w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 hover:-translate-y-1 transition-all duration-300">
                    <MessageCircle size={32} />
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-zinc-900 border border-white/10 text-white text-sm font-semibold rounded-xl shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                    Bize Ulaşın
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-zinc-900 border-t border-r border-white/10 rotate-45" />
                </div>
            </a>
        </motion.div>
    );
}
