"use client";

import { Link } from "@/i18n/navigation";
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
                className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${isScrolled
                    ? "bg-white/80 backdrop-blur-xl border-slate-100 py-3 shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
                    : "bg-white/40 backdrop-blur-xl border-transparent py-4"
                    }`}
            >
                <div className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e6c800]/40 to-transparent transition-opacity duration-300 ${isScrolled ? "opacity-100" : "opacity-0"}`} />
                <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[52px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-0 group" aria-label="ZYGSOFT Ana Sayfa">
                        <img
                            src="/brand/logo.svg"
                            alt="ZYGSOFT"
                            className="h-8 w-auto"
                            width={176}
                            height={32}
                        />
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-6 xl:gap-8">
                        <NavLink href="/" active={pathname === "/" || pathname === "/tr" || pathname === "/en"}>{nav("home")}</NavLink>

                        {/* Services dropdown */}
                        <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
                            <button className={`flex items-center gap-1.5 text-[13px] font-bold tracking-tight transition-colors duration-200 ${pathname.includes("/services") ? "text-slate-950" : "text-slate-600 hover:text-slate-950"}`}>
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

                        <NavLink href="/dijital-urunler" active={pathname.includes("/dijital-urunler")}>{nav("products")}</NavLink>
                        <NavLink href="/about" active={pathname.includes("/about")}>{nav("about")}</NavLink>
                        <NavLink href="/portfolio" active={pathname.includes("/portfolio")}>{nav("portfolio")}</NavLink>
                        <NavLink href="/blog" active={pathname.includes("/blog")}>{nav("blog")}</NavLink>
                        <NavLink href="/contact" active={pathname.includes("/contact")}>{nav("contact")}</NavLink>
                    </nav>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher isScrolled={isScrolled} />
                        {session ? (
                            <div className="flex items-center gap-3">
                                <Magnetic strength={18}>
                                    <Link href="/dashboard" className="bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] py-2.5 px-6 rounded-full hover:bg-[#e6c800] hover:text-slate-950 transition-all duration-200 shadow-lg shadow-slate-900/10" data-magnetic="true">
                                        Panel
                                    </Link>
                                </Magnetic>
                                <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-slate-600 hover:text-slate-950 text-[13px] font-bold transition-colors px-3 py-2 rounded-lg hover:bg-slate-50/80">
                                    Giriş
                                </Link>
                                <Magnetic strength={20}>
                                    <Link href="/register" className="bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] py-2.5 px-6 rounded-full hover:bg-[#e6c800] hover:text-slate-950 transition-all duration-200 shadow-lg shadow-slate-900/10" data-magnetic="true">
                                        Kayıt Ol
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
                                { name: nav("products"), href: "/dijital-urunler" },
                                { name: nav("about"), href: "/about" },
                                { name: nav("portfolio"), href: "/portfolio" },
                                { name: nav("blog"), href: "/blog" },
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
            className={`group relative text-[13px] font-bold tracking-tight transition-colors duration-200 ${active ? "text-slate-950" : "text-slate-600 hover:text-slate-950"}`}
        >
            {children}
            <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-[#e6c800] transition-all duration-200 ${active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"}`} />
        </Link>
    );
}
