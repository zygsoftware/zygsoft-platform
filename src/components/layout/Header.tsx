"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LogOut, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSession, signOut } from "next-auth/react";
import { Magnetic } from "@/components/ui/Magnetic";

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const nav = useTranslations("Navigation");
    const s = useTranslations("Services");
    const a = useTranslations("AppStore");

    const servicesLinks = [
        { name: s("socialMedia"), href: "/services/sosyal-medya-yonetimi" },
        { name: s("webDev"), href: "/services/web-ve-uygulama-gelistirme" },
        { name: s("branding"), href: "/services/marka-kimligi-ve-grafik-tasarim" },
        { name: s("digitalStrategy"), href: "/services/dijital-strateji-ve-pazarlama" },
        { name: s("audienceAnalysis"), href: "/services/hedef-kitle-analizi" },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${isScrolled
                    ? "bg-white/70 backdrop-blur-2xl border-[#0a0c10]/10 py-3 shadow-[0_12px_32px_rgba(10,12,16,0.08)]"
                    : "bg-white/30 backdrop-blur-xl border-transparent py-5"
                    }`}
            >
                <div className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/50 to-transparent transition-opacity ${isScrolled ? "opacity-100" : "opacity-0"}`} />
                <div className="container mx-auto px-6 flex items-center justify-between h-14">
                    {/* Logo - Defined as Outfit/Syne in globals.css */}
                    <Link href="/" className="flex items-center gap-0 group">
                        <span className="font-heading text-[26px] font-black tracking-[-0.03em] text-slate-950">
                            ZYG<span className="text-[#e6c800]">SOFT</span>
                        </span>
                    </Link>

                    {/* Nav - Defined as Inter/Sans in globals.css */}
                    <nav className="hidden md:flex items-center gap-7 xl:gap-8">
                        <NavLink href="/" active={pathname === "/" || pathname === "/tr" || pathname === "/en"}>{nav("home")}</NavLink>

                        {/* Services dropdown */}
                        <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
                            <button className={`flex items-center gap-1.5 text-[14px] font-bold tracking-tight transition-colors ${pathname.includes("/services") ? "text-slate-950" : "text-slate-700 hover:text-slate-950"}`}>
                                {nav("services")} <ChevronDown size={14} className={`transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isServicesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 mt-4 w-72 bg-white/95 backdrop-blur-xl border border-[#0a0c10]/10 shadow-2xl rounded-2xl overflow-hidden p-2"
                                    >
                                        {servicesLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="group flex items-center justify-between px-4 py-3 text-[14px] text-slate-700 hover:bg-[#fafafc] hover:text-slate-950 rounded-xl transition-all font-bold"
                                            >
                                                {link.name}
                                                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <NavLink href="/about" active={pathname.includes("/about")}>{nav("about")}</NavLink>
                        <NavLink href="/portfolio" active={pathname.includes("/portfolio")}>{nav("portfolio")}</NavLink>
                        <NavLink href="/blog" active={pathname.includes("/blog")}>{nav("blog")}</NavLink>
                        <NavLink href="/contact" active={pathname.includes("/contact")}>{nav("contact")}</NavLink>
                        <Link href="/abonelikler" className="flex items-center text-slate-700 hover:text-slate-950 text-[14px] font-bold tracking-tight transition-colors">
                            <span className="bg-[#e6c800]/25 text-[#0a0c10] px-2 py-0.5 rounded text-[10px] font-black mr-2">PRO</span>
                            {a("badge") || "Uygulamalar"}
                        </Link>
                    </nav>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-5">
                        <LanguageSwitcher isScrolled={isScrolled} />
                        {session ? (
                            <div className="flex items-center gap-4">
                                <Magnetic strength={20}>
                                    <Link href="/dashboard" className="bg-[#0a0c10] text-white text-[12px] font-black uppercase tracking-[0.18em] py-3 px-7 rounded-full hover:bg-[#e6c800] hover:text-[#0a0c10] transition-all duration-500 shadow-xl shadow-[#0a0c10]/15 border border-[#0a0c10]/10" data-magnetic="true">
                                        PANEL
                                    </Link>
                                </Magnetic>
                                <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Magnetic strength={20}>
                                    <Link href="/login" className="text-slate-950 hover:text-[#0a0c10] text-[13px] font-black uppercase tracking-[0.14em] transition-colors px-4" data-magnetic="true">
                                        Giriş
                                    </Link>
                                </Magnetic>
                                <Magnetic strength={30}>
                                    <Link href="/register" className="bg-[#0a0c10] text-white text-[12px] font-black uppercase tracking-[0.16em] py-3.5 px-8 rounded-full hover:bg-[#e6c800] hover:text-[#0a0c10] transition-all duration-500 shadow-xl shadow-slate-900/20 border border-[#0a0c10]/10" data-magnetic="true">
                                        KAYIT OL
                                    </Link>
                                </Magnetic>
                            </div>
                        )}
                    </div>


                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-[#1e293b] hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="fixed inset-0 top-20 z-40 bg-white flex flex-col p-8 overflow-y-auto md:hidden"
                    >
                        <div className="flex flex-col gap-2">
                            {[
                                { name: nav("home"), href: "/" },
                                { name: nav("services"), href: "/services" },
                                { name: nav("about"), href: "/about" },
                                { name: nav("portfolio"), href: "/portfolio" },
                                { name: nav("blog"), href: "/blog" },
                                { name: a("badge") || "Uygulamalar", href: "/abonelikler" },
                                { name: nav("contact"), href: "/contact" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xl font-semibold text-[#1e293b] py-4 border-b border-gray-100"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-3">
                            {session ? (
                                <>
                                    <Link href="/dashboard" className="bg-[#e6c800] text-[#1e293b] py-4 px-6 rounded-xl font-bold text-center block" onClick={() => setIsMobileMenuOpen(false)}>
                                        Panel
                                    </Link>
                                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="bg-red-50 text-red-500 py-4 px-6 rounded-xl font-bold text-center block w-full transition-colors">
                                        Çıkış Yap
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="bg-slate-100 hover:bg-slate-200 text-slate-950 py-4 px-6 rounded-xl font-bold text-center block transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                        {nav("login")}
                                    </Link>
                                    <Link href="/register" className="bg-[#e6c800] text-[#1e293b] py-4 px-6 rounded-xl font-bold text-center block" onClick={() => setIsMobileMenuOpen(false)}>
                                        {nav("register")}
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative text-[14px] font-bold tracking-tight transition-colors ${active ? "text-slate-950" : "text-slate-700 hover:text-slate-950"}`}
        >
            {children}
            <span className={`absolute -bottom-2 left-0 h-px bg-[#e6c800] transition-all duration-300 ${active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"}`} />
        </Link>
    );
}
