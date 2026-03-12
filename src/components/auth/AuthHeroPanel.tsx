"use client";

import { AuthLogo } from "./AuthShell";

type FeatureBullet = { label: string; value?: string };

type AuthHeroPanelProps = {
  title: string;
  titleAccent?: string;
  subtitle: string;
  features?: FeatureBullet[];
  footer?: React.ReactNode;
  /** For admin: show ShieldCheck icon */
  icon?: React.ReactNode;
};

const DEFAULT_FEATURES: FeatureBullet[] = [
  { label: "Güvenli belge işleme" },
  { label: "UYAP uyumlu araçlar" },
  { label: "KVKK uyumlu altyapı" },
];

export function AuthHeroPanel({
  title,
  titleAccent,
  subtitle,
  features = DEFAULT_FEATURES,
  footer,
  icon,
}: AuthHeroPanelProps) {
  return (
    <>
      {/* Light noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Subtle gold glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(230,200,0,0.4) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#e6c800]/[0.02]" aria-hidden />

      <div className="relative z-10 flex flex-col h-full w-full">
        <AuthLogo />
        <div className="flex-1 flex flex-col justify-center pt-8 lg:pt-10 xl:pt-14">
          {icon && (
            <div className="mb-6 text-[#e6c800]" aria-hidden>
              {icon}
            </div>
          )}
          <h2 className="font-display font-black text-white leading-[1.05] tracking-tight text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl">
            {title}
            {titleAccent && (
              <>
                <br />
                <span className="text-[#e6c800]">{titleAccent}</span>
              </>
            )}
          </h2>
          <p className="mt-4 sm:mt-5 text-white/80 text-[15px] xl:text-base font-medium max-w-sm leading-relaxed">
            {subtitle}
          </p>
          {features.length > 0 && (
            <ul className="mt-6 sm:mt-8 space-y-3" role="list">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-white/90">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6c800]/20 flex items-center justify-center text-[#e6c800] text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-[14px] xl:text-[15px] font-medium">{f.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footer && <div className="relative z-10 pt-6">{footer}</div>}
      </div>
    </>
  );
}
