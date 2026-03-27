"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowUpRight, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("Footer");
    const nav = useTranslations("Navigation");
    const s = useTranslations("Services");

    const year = new Date().getFullYear();

    const companyLinks = [
        { label: nav("home"), href: "/" },
        { label: nav("about"), href: "/about" },
        { label: nav("portfolio"), href: "/portfolio" },
        { label: nav("blog"), href: "/blog" },
    ];

    const featuredLinks = [
        { label: t("products"), href: "/dijital-urunler/hukuk-araclari-paketi" },
        { label: s("webDev"), href: "/services/web-ve-uygulama-gelistirme" },
        { label: s("branding"), href: "/services/marka-kimligi-ve-grafik-tasarim" },
        { label: s("digitalStrategy"), href: "/services/dijital-strateji-ve-pazarlama" },
    ];

    const legalLinks = [
        { label: t("legalKvkk"), href: "/kvkk" },
        { label: t("termsOfService"), href: "/terms" },
        { label: t("privacyPolicy"), href: "/privacy" },
    ];

    const socialLinks = [
        { label: "LinkedIn", href: "#" , Icon: Linkedin },
        { label: "Instagram", href: "#", Icon: Instagram },
    ];

    return (
        <footer className="site-footer relative overflow-hidden border-t border-white/8 bg-[#313434] text-white">
            <div className="container mx-auto max-w-[1400px] px-6 py-10 md:py-12">
                <div className="grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[1.05fr_0.95fr_0.8fr] lg:items-start">
                    <div>
                        <div className="inline-flex items-center">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/brand/ZYG_Logo_SQR.png"
                                    alt="ZYGSOFT icon"
                                    className="h-10 w-10 rounded-full object-cover"
                                    width={40}
                                    height={40}
                                />
                                <span className="text-[1.65rem] font-black tracking-[-0.04em] text-white">
                                    ZYGSOFT
                                </span>
                            </div>
                        </div>

                        <p className="mt-4 max-w-md text-sm font-medium leading-7 text-white md:text-[15px]">
                            {t("description")}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/dijital-urunler"
                                className="footer-action-secondary inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-white/40 hover:bg-white/5"
                            >
                                {t("products")}
                                <ArrowUpRight size={14} />
                            </Link>
                            <Link
                                href="/contact"
                                className="footer-action-primary inline-flex items-center gap-2 rounded-full bg-[#e6c800] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#313434] transition-colors hover:bg-[#d4b800]"
                            >
                                {nav("contact")}
                                <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2">
                        <div>
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                {t("company")}
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {companyLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition-colors hover:text-[#e6c800]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                Seçilmiş Alanlar
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {featuredLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition-colors hover:text-[#e6c800]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                            {t("contactInfo")}
                        </p>

                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:info@zygsoft.com"
                                className="inline-flex items-center gap-3 text-sm font-bold text-white transition-colors hover:text-[#e6c800]"
                            >
                                <span className="footer-accent-icon flex h-9 w-9 items-center justify-center rounded-xl border border-white/16 text-[#e6c800]">
                                    <Mail size={16} />
                                </span>
                                info@zygsoft.com
                            </a>

                            <a
                                href="tel:+905422916912"
                                className="inline-flex items-center gap-3 text-sm font-bold text-white transition-colors hover:text-[#e6c800]"
                            >
                                <span className="footer-accent-icon flex h-9 w-9 items-center justify-center rounded-xl border border-white/16 text-[#e6c800]">
                                    <Phone size={16} />
                                </span>
                                +90 542 291 69 12
                            </a>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            {socialLinks.map(({ href, label, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/16 text-white transition-colors hover:border-[#e6c800] hover:text-[#e6c800]"
                                    aria-label={label}
                                >
                                    <Icon size={17} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-bold text-white transition-colors hover:text-[#e6c800]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <p className="text-sm font-medium text-white">
                        © {year} ZYGSOFT. {t("copyright")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
