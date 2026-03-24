"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildConsentState, CONSENT_STORAGE_KEY, type ConsentState } from "@/lib/consent";

type CookieConsentBannerProps = {
    locale: string;
};

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: Array<Record<string, unknown>>;
    }
}

function applyConsent(state: ConsentState) {
    if (typeof window === "undefined") return;

    const payload = {
        analytics_storage: state.analytics ? "granted" : "denied",
        ad_storage: state.marketing ? "granted" : "denied",
        ad_user_data: state.marketing ? "granted" : "denied",
        ad_personalization: state.marketing ? "granted" : "denied",
    };

    if (typeof window.gtag === "function") {
        window.gtag("consent", "update", payload);
    } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "consent_update",
            ...payload,
        });
    }
}

export function CookieConsentBanner({ locale }: CookieConsentBannerProps) {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!saved) {
            setVisible(true);
            return;
        }

        try {
            const parsed = JSON.parse(saved) as ConsentState;
            setAnalyticsEnabled(parsed.analytics);
            setMarketingEnabled(parsed.marketing);
            applyConsent(parsed);
        } catch {
            setVisible(true);
        }
    }, []);

    const text = useMemo(() => {
        if (locale === "en") {
            return {
                title: "Cookie preferences",
                body: "We use essential cookies for site functionality and optional analytics/marketing cookies to improve measurement.",
                necessary: "Required",
                analytics: "Analytics",
                marketing: "Marketing",
                acceptAll: "Accept all",
                onlyNecessary: "Necessary only",
                save: "Save preferences",
                manage: "Manage preferences",
                privacy: "Privacy Policy",
            };
        }

        return {
            title: "Çerez tercihleri",
            body: "Site işlevselliği için zorunlu çerezler, ölçüm ve pazarlama için ise isteğe bağlı çerezler kullanıyoruz.",
            necessary: "Zorunlu",
            analytics: "Analitik",
            marketing: "Pazarlama",
            acceptAll: "Tümünü kabul et",
            onlyNecessary: "Sadece gerekli",
            save: "Tercihleri kaydet",
            manage: "Tercihleri yönet",
            privacy: "Gizlilik Politikası",
        };
    }, [locale]);

    const persist = (state: ConsentState) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
        applyConsent(state);
        setVisible(false);
        setShowDetails(false);
    };

    const acceptAll = () => persist(buildConsentState({ analytics: true, marketing: true }));
    const acceptNecessaryOnly = () => persist(buildConsentState({ analytics: false, marketing: false }));
    const saveCustom = () =>
        persist(buildConsentState({ analytics: analyticsEnabled, marketing: marketingEnabled }));

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-[120] px-4">
            <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-5 p-5 md:p-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-black text-slate-950">{text.title}</h2>
                        <p className="text-sm leading-relaxed text-slate-600">
                            {text.body}{" "}
                            <Link href="/privacy" className="font-bold text-slate-950 underline underline-offset-4">
                                {text.privacy}
                            </Link>
                        </p>
                    </div>

                    {showDetails ? (
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-black text-slate-950">{text.necessary}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {locale === "en" ? "Always active for login, language and security." : "Giriş, dil ve güvenlik için her zaman aktiftir."}
                                </p>
                            </div>
                            <label className="rounded-2xl border border-slate-200 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-950">{text.analytics}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {locale === "en" ? "GA4 and product analytics." : "GA4 ve ürün analitiği."}
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={analyticsEnabled}
                                        onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                </div>
                            </label>
                            <label className="rounded-2xl border border-slate-200 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-950">{text.marketing}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {locale === "en" ? "Google Ads and Meta Pixel." : "Google Ads ve Meta Pixel."}
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={marketingEnabled}
                                        onChange={(e) => setMarketingEnabled(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                </div>
                            </label>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowDetails((prev) => !prev)}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            {text.manage}
                        </button>
                        <button
                            type="button"
                            onClick={acceptNecessaryOnly}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            {text.onlyNecessary}
                        </button>
                        {showDetails ? (
                            <button
                                type="button"
                                onClick={saveCustom}
                                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                            >
                                {text.save}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={acceptAll}
                            className="rounded-2xl bg-[#e6c800] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#cfb500]"
                        >
                            {text.acceptAll}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
