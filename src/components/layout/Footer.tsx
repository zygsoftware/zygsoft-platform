"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Magnetic } from "@/components/ui/Magnetic";
import { motion } from "framer-motion";

export function Footer() {
    const t = useTranslations("Footer");
    const nav = useTranslations("Navigation");
    const s = useTranslations("Services");

    const year = new Date().getFullYear();

    const links = {
        company: [
            { label: nav("home"), href: "/" },
            { label: nav("about"), href: "/about" },
            { label: nav("portfolio"), href: "/portfolio" },
            { label: nav("blog"), href: "/blog" },
            { label: nav("contact"), href: "/contact" },
        ],
        products: [
            { label: t("products"), href: "/abonelikler" },
        ],
        services: [
            { label: s("webDev"), href: "/services/web-ve-uygulama-gelistirme" },
            { label: s("socialMedia"), href: "/services/sosyal-medya-yonetimi" },
            { label: s("branding"), href: "/services/marka-kimligi-ve-grafik-tasarim" },
            { label: s("digitalStrategy"), href: "/services/dijital-strateji-ve-pazarlama" },
            { label: "AI Solutions", href: "/services" },
        ],
        legal: [
            { label: "KVKK", href: "/kvkk" },
            { label: "Kullanıcı Sözleşmesi", href: "/terms" },
            { label: "Gizlilik Politikası", href: "/privacy" },
        ],
    };

    return (
        <footer className="relative bg-white text-slate-950 pt-32 pb-12 overflow-hidden border-t border-slate-100">
            <div className="container mx-auto px-6 max-w-[1400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-32">
                    {/* Brand col */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="inline-block mb-10 group">
                            <span className="font-display text-4xl font-black tracking-[-0.05em] group-hover:text-[#e6c800] transition-colors duration-500">
                                ZYG<span className="text-[#e6c800] group-hover:text-slate-950 transition-colors duration-500">SOFT</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-xl font-medium leading-tight max-w-sm mb-12">
                            {t("description")}
                        </p>
                        <div className="flex flex-col gap-4 text-slate-950 font-black text-lg">
                            <Magnetic strength={15}>
                                <a href="mailto:info@zygsoft.com" className="flex items-center gap-3 hover:text-[#e6c800] transition-colors w-fit" data-magnetic="true">
                                    info@zygsoft.com
                                </a>
                            </Magnetic>
                            <p className="text-slate-400 font-medium">Antalya, Türkiye</p>
                        </div>
                    </div>

                    {/* Links cols */}
                    <div className="lg:col-span-2">
                        <h4 className="font-display font-black text-xs uppercase tracking-[0.3em] text-[#e6c800] mb-10">{t("company")}</h4>
                        <ul className="space-y-4">
                            {links.company.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-slate-600 hover:text-slate-950 text-base font-bold transition-all flex items-center group">
                                        {l.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-display font-black text-xs uppercase tracking-[0.3em] text-[#e6c800] mb-10">{t("products")}</h4>
                        <ul className="space-y-4">
                            {links.products.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-slate-600 hover:text-slate-950 text-base font-bold transition-all flex items-center group">
                                        {l.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-display font-black text-xs uppercase tracking-[0.3em] text-[#e6c800] mb-10">{t("services")}</h4>
                        <ul className="space-y-4">
                            {links.services.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-slate-600 hover:text-slate-950 text-base font-bold transition-all flex items-center group">
                                        {l.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-display font-black text-xs uppercase tracking-[0.3em] text-[#e6c800] mb-10">{t("social")}</h4>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "LinkedIn", href: "#" },
                                { label: "Instagram", href: "#" },
                                { label: "Twitter", href: "#" },
                            ].map((social, i) => (
                                <Magnetic key={i} strength={15}>
                                    <a href={social.href} className="text-slate-600 hover:text-slate-950 font-bold transition-colors w-fit" data-magnetic="true">
                                        {social.label}
                                    </a>
                                </Magnetic>
                            ))}
                        </div>
                    </div>
                </div>



                {/* Bottom bar */}
                <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-400 text-sm font-medium">
                        © {year} ZYGSOFT. {t("copyright")}
                    </p>
                    <div className="flex gap-8">
                        {links.legal.map(l => (
                            <Link key={l.href} href={l.href} className="text-slate-400 hover:text-slate-950 text-xs font-bold transition-colors">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
