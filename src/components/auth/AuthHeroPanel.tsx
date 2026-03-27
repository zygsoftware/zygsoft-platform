"use client";

import { useTranslations } from "next-intl";
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

export function AuthHeroPanel({
  title,
  titleAccent,
  subtitle,
  features,
  footer,
  icon,
}: AuthHeroPanelProps) {
  const t = useTranslations("Auth.shared.heroFeatures");
  const resolvedFeatures = features ?? [
    { label: t("secureProcessing") },
    { label: t("uyapTools") },
    { label: t("kvkkInfrastructure") },
  ];
  return (
    <div
      className="relative z-10 flex flex-col h-full w-full text-white"
      style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff" }}
    >
        <AuthLogo />
        <div className="flex-1 flex flex-col justify-center pt-8 lg:pt-10 xl:pt-14">
          {icon && (
            <div className="mb-6 text-[#e6c800]" aria-hidden>
              {icon}
            </div>
          )}
          <h2
            className="font-display font-black text-white leading-[1.05] tracking-tight text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl"
            style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff", textShadow: "0 2px 18px rgba(0, 0, 0, 0.28)" }}
          >
            {title}
            {titleAccent && (
              <>
                <br />
                <span style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff" }}>{titleAccent}</span>
              </>
            )}
          </h2>
          <p
            className="mt-4 sm:mt-5 text-[15px] xl:text-base font-medium max-w-sm leading-relaxed text-white"
            style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff", textShadow: "0 1px 12px rgba(0, 0, 0, 0.22)" }}
          >
            {subtitle}
          </p>
          {resolvedFeatures.length > 0 && (
            <ul className="mt-6 sm:mt-8 space-y-3" role="list">
              {resolvedFeatures.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 text-white"
                  style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff", textShadow: "0 1px 10px rgba(0, 0, 0, 0.18)" }}
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6c800]/25 flex items-center justify-center text-[#f4dc56] text-xs font-bold ring-1 ring-[#e6c800]/20">
                    ✓
                  </span>
                  <span
                    className="text-[14px] xl:text-[15px] font-semibold text-white"
                    style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff" }}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footer && (
          <div
            className="relative z-10 pt-6 text-white"
            style={{ color: "#ffffff", opacity: 1, WebkitTextFillColor: "#ffffff", textShadow: "0 1px 10px rgba(0, 0, 0, 0.18)" }}
          >
            {footer}
          </div>
        )}
    </div>
  );
}
