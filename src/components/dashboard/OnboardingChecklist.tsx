"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Mail,
    Zap,
    FileText,
    ShoppingBag,
    CheckCircle2,
    Loader2,
    X,
    ChevronRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { pushDataLayerEvent, pushTrialStartEvent } from "@/lib/analytics";

type StepStatus = "pending" | "active" | "completed";

type OnboardingChecklistProps = {
    emailVerified: boolean;
    trialStatus: string;
    trialOperationsUsed: number;
    hasSubscription: boolean;
    onDismiss: () => void;
};

const STEPS = [
    { id: "email", icon: Mail },
    { id: "trial", icon: Zap },
    { id: "first-tool", icon: FileText },
    { id: "evaluate", icon: ShoppingBag },
] as const;

function getStepStatus(
    stepId: (typeof STEPS)[number]["id"],
    props: OnboardingChecklistProps
): StepStatus {
    const { emailVerified, trialStatus, trialOperationsUsed } = props;

    switch (stepId) {
        case "email":
            if (emailVerified) return "completed";
            return "active";
        case "trial":
            if (!emailVerified) return "pending";
            if (trialStatus !== "none") return "completed";
            return "active";
        case "first-tool":
            if (!emailVerified || trialStatus === "none") return "pending";
            if (trialStatus !== "active") return "completed"; // expired/converted = done
            if (trialOperationsUsed > 0) return "completed";
            return "active";
        case "evaluate":
            if (trialOperationsUsed === 0) return "pending";
            if (props.hasSubscription) return "completed";
            return "active";
        default:
            return "pending";
    }
}

export function OnboardingChecklist(props: OnboardingChecklistProps) {
    const { hasSubscription, onDismiss } = props;
    const locale = useLocale();
    const t = useTranslations("Dashboard.shared.onboarding");
    const [startingTrial, setStartingTrial] = useState(false);
    const [dismissing, setDismissing] = useState(false);

    if (hasSubscription) return null;

    const completedCount = STEPS.filter((s) => getStepStatus(s.id, props) === "completed").length;
    const progressPct = (completedCount / STEPS.length) * 100;

    const handleStartTrial = async () => {
        setStartingTrial(true);
        try {
            const res = await fetch("/api/trial/start", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                pushDataLayerEvent("trial_start", {
                    source: "onboarding",
                    trial_days: 3,
                    trial_product: "legal-toolkit",
                    locale,
                });
                pushTrialStartEvent({
                    source: "onboarding",
                    trial_days: 3,
                    trial_product: "legal-toolkit",
                    locale,
                });
                window.location.reload();
            } else {
                alert(data.error || t("genericError"));
            }
        } catch {
            alert(t("connectionError"));
        } finally {
            setStartingTrial(false);
        }
    };

    const handleDismiss = async () => {
        setDismissing(true);
        try {
            const res = await fetch("/api/account/complete-onboarding", { method: "POST" });
            if (res.ok) {
                onDismiss();
                window.location.reload();
            }
        } finally {
            setDismissing(false);
        }
    };

    const packageHref = locale === "en" ? "/en/dijital-urunler/hukuk-araclari-paketi" : "/dijital-urunler/hukuk-araclari-paketi";
    const toolsHref = "/document-tools";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e6c800]/15 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-[#e6c800]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#343131]">{t("title")}</h3>
                        <p className="text-xs text-slate-500">
                            {t("completedCount", { completed: completedCount, total: STEPS.length })}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    disabled={dismissing}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                    {dismissing ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    {t("dismiss")}
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-[#e6c800]"
                />
            </div>

            <div className="p-6 space-y-3">
                {STEPS.map((step, index) => {
                    const status = getStepStatus(step.id, props);
                    const Icon = step.icon;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                status === "active"
                                    ? "bg-[#e6c800]/5 border-[#e6c800]/30"
                                    : status === "completed"
                                        ? "bg-slate-50/50 border-slate-100"
                                        : "bg-slate-50/30 border-slate-100"
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    status === "completed"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : status === "active"
                                            ? "bg-[#e6c800]/20 text-[#b89600]"
                                            : "bg-slate-100 text-slate-400"
                                }`}
                            >
                                {status === "completed" ? (
                                    <CheckCircle2 size={20} />
                                ) : (
                                    <Icon size={20} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm font-medium ${
                                        status === "completed" ? "text-slate-500 line-through" : "text-[#343131]"
                                    }`}
                                >
                                    {step.id === "email" ? t("stepEmail") : step.id === "trial" ? t("stepTrial") : step.id === "first-tool" ? t("stepFirstTool") : t("stepEvaluate")}
                                </p>
                            </div>
                            <div className="shrink-0">
                                {step.id === "email" && status === "active" && (
                                    <Link
                                        href={locale === "en" ? "/en/verify-email-required" : "/verify-email-required"}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#343131] bg-[#e6c800] rounded-lg hover:bg-[#d4b800] transition-colors"
                                    >
                                        {t("verify")} <ChevronRight size={14} />
                                    </Link>
                                )}
                                {step.id === "trial" && status === "active" && (
                                    <button
                                        onClick={handleStartTrial}
                                        disabled={startingTrial}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#343131] bg-[#e6c800] rounded-lg hover:bg-[#d4b800] transition-colors disabled:opacity-70"
                                    >
                                        {startingTrial ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <>
                                                {t("startDemo")} <ChevronRight size={14} />
                                            </>
                                        )}
                                    </button>
                                )}
                                {step.id === "first-tool" && status === "active" && (
                                    <Link
                                        href={toolsHref}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#343131] bg-[#e6c800] rounded-lg hover:bg-[#d4b800] transition-colors"
                                    >
                                        {t("firstTool")} <ChevronRight size={14} />
                                    </Link>
                                )}
                                {step.id === "evaluate" && status === "active" && (
                                    <Link
                                        href={packageHref}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#343131] bg-[#e6c800] rounded-lg hover:bg-[#d4b800] transition-colors"
                                    >
                                        {t("reviewPackage")} <ChevronRight size={14} />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
