"use client";

import Link from "next/link";

type LinkItem = {
    href: string;
    label: React.ReactNode;
};

type AuthFooterLinksProps = {
    links: LinkItem[];
    className?: string;
};

export function AuthFooterLinks({ links, className = "" }: AuthFooterLinksProps) {
    return (
        <div className={`flex flex-col gap-3 text-center ${className}`}>
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] font-semibold text-zinc-600 hover:text-[#0a0c10] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800]/50 focus-visible:ring-offset-2 rounded [&_.accent]:text-[#e6c800] [&_.accent]:hover:text-[#c9ad00]"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}
