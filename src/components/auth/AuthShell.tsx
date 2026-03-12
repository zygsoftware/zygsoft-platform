"use client";

import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
  hero?: React.ReactNode;
  showHero?: boolean;
};

export function AuthShell({ children, hero, showHero = true }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fafafc] selection:bg-[#e6c800] selection:text-[#0a0c10]">
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 30h60M30 0v60' stroke='%230a0c10' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mobile: Hero above */}
      {showHero && hero && (
        <aside className="lg:hidden w-full flex-shrink-0 bg-[#0a0c10] relative overflow-hidden min-h-[200px] flex items-center justify-center p-8">
          {hero}
        </aside>
      )}

      {/* Desktop: Hero left panel */}
      {showHero && hero && (
        <aside className="hidden lg:flex lg:w-[42%] xl:w-[46%] flex-shrink-0 flex-col justify-between p-12 xl:p-16 2xl:p-20 bg-[#0a0c10] relative overflow-hidden">
          {hero}
        </aside>
      )}

      {/* Form panel */}
      <main className="flex-1 min-h-0 flex items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
}

export function AuthLogo() {
  return (
    <Link
      href="/"
      className="block hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c800] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10] rounded"
      aria-label="ZYGSOFT Ana Sayfa"
    >
      <img
        src="/brand/logo-dark.svg"
        alt="ZYGSOFT"
        className="h-8 xl:h-9 w-auto"
        width={198}
        height={36}
      />
    </Link>
  );
}
