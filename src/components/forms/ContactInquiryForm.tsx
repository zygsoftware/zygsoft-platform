"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePrefillUserFields } from "@/hooks/usePrefillUserFields";

type ContactInquiryFormProps = {
    title?: string;
    subtitle?: string;
    className?: string;
};

type Status = "idle" | "success" | "error";

const INITIAL_FORM = {
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
};

export function ContactInquiryForm({
    title = "Projenizi Konuşalım",
    subtitle = "Detayları iletin, 24 saat içinde geri dönelim.",
    className = "",
}: ContactInquiryFormProps) {
    const locale = useLocale();
    const t = useTranslations("Contact");
    const isTr = locale === "tr";
    const [form, onChange, reset] = usePrefillUserFields(INITIAL_FORM, ["name", "email", "phone", "company"]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorText, setErrorText] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("idle");
        setErrorText("");

        if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
            setStatus("error");
            setErrorText(t("formErrorRequired"));
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                setStatus("error");
                setErrorText(data?.error || t("formErrorNetwork"));
                return;
            }

            setStatus("success");
            reset();
        } catch {
            setStatus("error");
            setErrorText(t("formErrorNetwork"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const topicOptions = isTr
        ? [
            "Web Tasarım ve Geliştirme",
            "Özel Yazılım ve Otomasyon",
            "Dijital Dönüşüm Danışmanlığı",
            "Legal UDF Converter",
            "Sosyal Medya Yönetimi",
            "Diğer",
        ]
        : [
            "Web Design and Development",
            "Custom Software and Automation",
            "Digital Transformation Consulting",
            "Legal UDF Converter",
            "Social Media Management",
            "Other",
        ];

    return (
        <div className={`rounded-2xl border border-[#0a0c10]/[0.06] bg-white p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] ${className}`}>
            <h3 className="text-2xl md:text-3xl font-display font-black text-[#0a0c10] mb-2">{title}</h3>
            <p className="text-[#0a0c10]/55 text-sm md:text-base mb-8">{subtitle}</p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label={`${t("formName")} *`}
                        value={form.name}
                        onChange={(v) => onChange("name", v)}
                        placeholder={t("formNamePlaceholder")}
                    />
                    <Field
                        label={`${t("formEmail")} *`}
                        type="email"
                        value={form.email}
                        onChange={(v) => onChange("email", v)}
                        placeholder={t("formEmailPlaceholder")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label={t("formPhone")}
                        type="tel"
                        value={form.phone}
                        onChange={(v) => onChange("phone", v)}
                        placeholder={t("formPhonePlaceholder")}
                    />
                    <Field
                        label={t("formCompany")}
                        value={form.company}
                        onChange={(v) => onChange("company", v)}
                        placeholder={t("formCompanyPlaceholder")}
                    />
                </div>

                <div>
                    <label className="input-label">
                        {t("formTopic")} *
                    </label>
                    <select
                        required
                        value={form.subject}
                        onChange={(e) => onChange("subject", e.target.value)}
                        className="input-base"
                    >
                        <option value="">{t("formTopicPlaceholder")}</option>
                        {topicOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#0a0c10]/55 mb-2">
                        {t("formMessage")} *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => onChange("message", e.target.value)}
                        placeholder={t("formMessagePlaceholder")}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e6c800]/30 focus:border-[#e6c800] transition-all duration-200 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full btn-primary py-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            {t("formSending")}
                        </>
                    ) : (
                        <>
                            <Send size={15} className="group-hover:translate-x-0.5 transition-transform" />
                            {t("formSend")}
                        </>
                    )}
                </button>
            </form>

            <p className="mt-4 text-xs text-[#0a0c10]/55">
                {t("formPrivacyNote")}
            </p>

            {status === "success" && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                    {t("formSuccessDetail")}
                </div>
            )}

            {status === "error" && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                    {errorText || t("formErrorNetwork")}
                </div>
            )}
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
}) {
    return (
        <div>
            <label className="input-label">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input-base"
            />
        </div>
    );
}

