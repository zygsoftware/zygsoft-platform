"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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
    title = "Projenizi Konusalim",
    subtitle = "Detaylari iletin, 24 saat icinde geri donelim.",
    className = "",
}: ContactInquiryFormProps) {
    const locale = useLocale();
    const t = useTranslations("Contact");
    const isTr = locale === "tr";
    const [form, setForm] = useState(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorText, setErrorText] = useState("");

    const onChange = (key: keyof typeof INITIAL_FORM, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

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
            setForm(INITIAL_FORM);
        } catch {
            setStatus("error");
            setErrorText(t("formErrorNetwork"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const topicOptions = isTr
        ? [
            "Web Tasarim ve Gelistirme",
            "Ozel Yazilim ve Otomasyon",
            "Dijital Donusum Danismanligi",
            "Legal UDF Converter",
            "Sosyal Medya Yonetimi",
            "Diger",
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
        <div className={`rounded-[2rem] border border-[#0a0c10]/10 bg-white p-7 md:p-9 shadow-sm ${className}`}>
            <h3 className="text-2xl md:text-3xl font-display font-black text-[#0a0c10] mb-2">{title}</h3>
            <p className="text-[#0a0c10]/60 text-sm md:text-base mb-7">{subtitle}</p>

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
                    <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#0a0c10]/55 mb-2">
                        {t("formTopic")} *
                    </label>
                    <select
                        required
                        value={form.subject}
                        onChange={(e) => onChange("subject", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#0a0c10]/12 bg-white text-sm text-[#0a0c10] focus:outline-none focus:ring-4 focus:ring-[#e6c800]/20 focus:border-[#e6c800] transition-all"
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
                        className="w-full px-4 py-3 rounded-xl border border-[#0a0c10]/12 bg-white text-sm text-[#0a0c10] placeholder:text-[#0a0c10]/40 focus:outline-none focus:ring-4 focus:ring-[#e6c800]/20 focus:border-[#e6c800] transition-all resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0a0c10] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#e6c800] hover:text-[#0a0c10] transition-colors disabled:opacity-70"
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
            <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#0a0c10]/55 mb-2">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-[#0a0c10]/12 bg-white text-sm text-[#0a0c10] placeholder:text-[#0a0c10]/40 focus:outline-none focus:ring-4 focus:ring-[#e6c800]/20 focus:border-[#e6c800] transition-all"
            />
        </div>
    );
}

