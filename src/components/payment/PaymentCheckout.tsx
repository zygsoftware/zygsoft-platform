"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Copy,
    Loader2,
    Mail,
    UploadCloud,
    X,
} from "lucide-react";
import { pushDataLayerEvent, pushLeadEvent } from "@/lib/analytics";
import {
    BANK_TRANSFER_DETAILS,
    PAYMENT_METHODS,
    PAYMENT_SUPPORT,
    PRODUCTS,
    type PaymentMethodId,
    type ProductSlug,
} from "@/components/payment/payment-config";

type Step = 1 | 2 | 3;
type SessionUser = { email?: string | null };

type PaymentCheckoutProps = {
    productId?: ProductSlug;
    mode?: "page" | "modal";
    onClose?: () => void;
    onModalBusyChange?: (busy: boolean) => void;
};

const stepTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
};

function MinimalStepper({
    step,
    labels,
}: {
    step: Step;
    labels: string[];
}) {
    return (
        <div className="flex items-center gap-2">
            {labels.map((label, index) => {
                const itemStep = (index + 1) as Step;
                const active = itemStep === step;
                const done = itemStep < step;

                return (
                    <div key={label} className="flex min-w-0 flex-1 items-center gap-1.5">
                        <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                                active
                                    ? "border-slate-950 bg-slate-950 text-white"
                                    : done
                                      ? "border-[#e6c800] bg-[#fff4c6] text-slate-950"
                                      : "border-slate-200 bg-white text-slate-400"
                            }`}
                        >
                            {done ? <Check size={14} /> : String(index + 1).padStart(2, "0")}
                        </div>
                        <span className={`truncate text-[11px] font-black uppercase tracking-[0.14em] ${active ? "text-slate-950" : "text-slate-400"}`}>
                            {label}
                        </span>
                        {index < labels.length - 1 ? <div className="hidden h-px flex-1 bg-slate-200 md:block" /> : null}
                    </div>
                );
            })}
        </div>
    );
}

function CompactCopyField({
    label,
    value,
    copied,
    copyLabel,
    copiedLabel,
    mono = false,
    onCopy,
}: {
    label: string;
    value: string;
    copied: boolean;
    copyLabel: string;
    copiedLabel: string;
    mono?: boolean;
    onCopy: () => void;
}) {
    return (
        <div className="rounded-[1.1rem] border border-slate-200/90 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className={`mt-1 break-all text-sm font-black text-slate-950 ${mono ? "font-mono text-[13px]" : ""}`}>
                        {value}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCopy}
                    className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                        copied
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? copiedLabel : copyLabel}
                </button>
            </div>
        </div>
    );
}

export function PaymentCheckout({
    productId: initialProductId,
    mode = "page",
    onClose,
    onModalBusyChange,
}: PaymentCheckoutProps) {
    const locale = useLocale();
    const isTr = locale === "tr";
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const sessionUser = session?.user as SessionUser | undefined;

    const [productId, setProductId] = useState<ProductSlug>(initialProductId ?? "legal-toolkit");
    const [step, setStep] = useState<Step>(1);
    const [method, setMethod] = useState<PaymentMethodId>("bank-transfer");
    const [note, setNote] = useState("");
    const [fileName, setFileName] = useState("");
    const [receiptBase64, setReceiptBase64] = useState("");
    const [confirmedTransfer, setConfirmedTransfer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        if (initialProductId) {
            setProductId(initialProductId);
            return;
        }

        const requestedProduct = searchParams.get("product");
        if (requestedProduct === "legal-toolkit") {
            setProductId("legal-toolkit");
        }
    }, [initialProductId, searchParams]);

    useEffect(() => {
        onModalBusyChange?.(submitting);
    }, [submitting, onModalBusyChange]);

    const product = PRODUCTS[productId];
    const productName = isTr ? product.titleTr : product.titleEn;
    const productDesc = isTr ? product.descTr : product.descEn;
    const productFeatures = isTr ? product.featuresTr : product.featuresEn;
    const amount = `₺${product.price.toLocaleString(isTr ? "tr-TR" : "en-US")}`;
    const loginHref = `/login?callbackUrl=${encodeURIComponent(`/payment?product=${productId}`)}`;
    const registerHref = `/register?callbackUrl=${encodeURIComponent(`/payment?product=${productId}`)}`;

    const copy = isTr
        ? {
              title: "Ödeme",
              steps: ["Sipariş", "Yöntem", "Onay"],
              total: "Toplam",
              annual: "Yıllık erişim",
              continue: "Devam et",
              back: "Geri",
              close: "Kapat",
              copyLabel: "Kopyala",
              copiedLabel: "Kopyalandı",
              noteLabel: "Sipariş notu",
              notePlaceholder: "İsterseniz şirket adı, fatura notu veya kısa bir açıklama ekleyin.",
              methodActive: "Aktif",
              methodSoon: "Yakında",
              bank: "Banka",
              receiver: "Alıcı Adı",
              iban: "IBAN",
              orderTitle: "Siparişi gözden geçirin",
              orderDesc: "Ürün, fiyat ve not alanını kontrol edin.",
              methodTitle: "Ödeme yöntemini seçin",
              methodDesc: "Banka havalesi aktif. Ödeme linki daha sonra eklenecek.",
              confirmTitle: "Ödeme bildirimi oluşturun",
              confirmDesc: "Bildirim gönderin, onay sonrası erişim açılsın.",
              authTitle: "Devam etmek için giriş yapın",
              authDesc: "Ödeme bildirimi oluşturabilmek için hesabınızla oturum açmanız gerekiyor.",
              login: "Giriş yap",
              register: "Hesap oluştur",
              account: "Hesap",
              optional: "Opsiyonel",
              receipt: "Dekont yükle",
              receiptHint: "JPG, PNG veya PDF",
              receiptHelp: "Dekont yüklemeden de ödeme bildirimi oluşturabilirsiniz.",
              selectedFile: "Seçilen dosya",
              confirmCheckbox: "Havale işlemini tamamladım ve bildirimi göndermeye hazırım.",
              nextSteps: "Sonraki adımlar",
              reviewStep: "Bildirim kısa sürede incelenir.",
              deliveryStep: "Onaydan sonra erişim hesabınıza tanımlanır.",
              supportStep: "Gerekirse destek ekibi size döner.",
              support: "Destek",
              reassurance: "Her adım hesabınızla ilişkilendirilir. Ödeme kaydınız güvenli şekilde takip edilir.",
              submit: "Ödemeyi tamamla",
              sending: "İşleniyor",
              authRequired: "Önce giriş yapmalısınız.",
              checkboxError: "Devam etmek için havaleyi tamamladığınızı onaylayın.",
              genericError: "Bir hata oluştu. Lütfen tekrar deneyin.",
              successTitle: "Ödeme tamamlandı",
              successDesc: "Havale bildiriminiz başarıyla alındı. İnceleme sonrasında erişiminiz açılacaktır.",
              successMeta: "Genellikle aynı gün içinde sonuçlanır.",
              newNotice: "Yeni bildirim",
              accountButton: "Hesabıma git",
          }
        : {
              title: "Payment",
              steps: ["Order", "Method", "Confirm"],
              total: "Total",
              annual: "Annual access",
              continue: "Continue",
              back: "Back",
              close: "Close",
              copyLabel: "Copy",
              copiedLabel: "Copied",
              noteLabel: "Order note",
              notePlaceholder: "Add a company name, billing note, or a short message if needed.",
              methodActive: "Active",
              methodSoon: "Coming soon",
              bank: "Bank",
              receiver: "Account holder",
              iban: "IBAN",
              orderTitle: "Review your order",
              orderDesc: "Check the product, price, and note before continuing.",
              methodTitle: "Select your payment method",
              methodDesc: "Bank transfer is active. Payment link can be added later.",
              confirmTitle: "Create your payment notice",
              confirmDesc: "Send the notice and unlock access after approval.",
              authTitle: "Sign in to continue",
              authDesc: "You need to be signed in before creating a payment notice.",
              login: "Sign in",
              register: "Create account",
              account: "Account",
              optional: "Optional",
              receipt: "Upload receipt",
              receiptHint: "JPG, PNG, or PDF",
              receiptHelp: "You can continue without uploading a receipt.",
              selectedFile: "Selected file",
              confirmCheckbox: "I completed the transfer and I am ready to submit the notice.",
              nextSteps: "Next steps",
              reviewStep: "Your notice is reviewed quickly.",
              deliveryStep: "Access is assigned after approval.",
              supportStep: "Support reaches back if needed.",
              support: "Support",
              reassurance: "Every step stays tied to your account, so the payment record is easy to verify and track.",
              submit: "Complete payment",
              sending: "Processing",
              authRequired: "Please sign in first.",
              checkboxError: "Please confirm that you completed the transfer.",
              genericError: "Something went wrong. Please try again.",
              successTitle: "Payment completed",
              successDesc: "Your transfer notice has been received successfully. Access will be assigned after review.",
              successMeta: "Usually completed on the same day.",
              newNotice: "New notice",
              accountButton: "Go to account",
          };

    const shellClass =
        mode === "modal"
            ? "relative grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#fcfbf7] shadow-[0_30px_120px_rgba(15,23,42,0.22)]"
            : "relative grid min-h-[720px] w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#fcfbf7] shadow-[0_18px_48px_rgba(15,23,42,0.08)]";

    const headerTitle =
        step === 1 ? copy.orderTitle : step === 2 ? copy.methodTitle : copy.confirmTitle;
    const headerDescription =
        step === 1 ? copy.orderDesc : step === 2 ? copy.methodDesc : copy.confirmDesc;
    const formId = "payment-confirm-form";
    const contentMaxWidthClass = step === 1 ? "max-w-[860px]" : "max-w-[960px]";
    const receiptInputId = "payment-receipt-input";

    const stepLabel = `${String(step).padStart(2, "0")} / 03`;
    const focusLabel =
        step === 1
            ? isTr
                ? "Sipariş özeti"
                : "Order summary"
            : step === 2
              ? isTr
                  ? "Ödeme yöntemi"
                  : "Payment method"
              : isTr
                ? "Ödeme onayı"
                : "Payment confirmation";

    const handleCopy = async (field: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            window.setTimeout(() => setCopiedField(null), 1400);
        } catch {
            setCopiedField(null);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError("");

        const reader = new FileReader();
        reader.onloadend = () => setReceiptBase64(reader.result as string);
        reader.readAsDataURL(file);
    };

    const resetState = () => {
        setSuccess(false);
        setStep(1);
        setMethod("bank-transfer");
        setNote("");
        setFileName("");
        setReceiptBase64("");
        setConfirmedTransfer(false);
        setError("");
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (status !== "authenticated") {
            setError(copy.authRequired);
            return;
        }

        if (!confirmedTransfer) {
            setError(copy.checkboxError);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/payments/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: product.price,
                    receiptImage: receiptBase64 || null,
                    productId,
                    note: note.trim() || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || copy.genericError);
                return;
            }

            pushDataLayerEvent("payment_notify", {
                payment_amount: product.price,
                payment_locale: locale,
                payment_product_id: productId,
                payment_product_name: productId,
                payment_method: method,
            });

            pushLeadEvent({
                lead_type: "payment_notification",
                value: product.price,
                currency: "TRY",
                payment_locale: locale,
                payment_product_id: productId,
                payment_product_name: productId,
            });

            setSuccess(true);
        } catch {
            setError(copy.genericError);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <section className={shellClass}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.12),transparent_40%)]" />
                <div className="relative flex h-full min-h-0 flex-col">
                    <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">{copy.title}</p>
                            <h2 className="mt-3 text-[clamp(1.9rem,4vw,2.8rem)] font-heading font-black leading-none text-slate-950">
                                {copy.successTitle}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700"
                            aria-label={copy.close}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                        <motion.div
                            initial={{ scale: 0.86, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                        >
                            <CheckCircle2 size={42} strokeWidth={2.2} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08, duration: 0.28 }}
                            className="mt-8 max-w-xl"
                        >
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{productName}</p>
                            <p className="mt-4 text-lg font-medium leading-8 text-slate-700">{copy.successDesc}</p>
                            <p className="mt-3 text-sm font-medium text-slate-500">{copy.successMeta}</p>
                        </motion.div>
                    </div>

                    <div className="border-t border-slate-200 px-6 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetState}
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-300"
                            >
                                {copy.newNotice}
                            </button>
                            <Link
                                href="/dashboard/account"
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                            >
                                {copy.accountButton}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={shellClass} aria-labelledby="payment-checkout-title" aria-describedby="payment-checkout-subtitle">
            <header className="shrink-0 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(252,251,247,0.98))] px-5 py-3.5 backdrop-blur-xl sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                            {copy.title} • {stepLabel}
                        </div>
                        <p className="truncate text-sm font-black text-slate-950">{productName}</p>
                    </div>

                    <div className="min-w-0 flex-1 lg:max-w-[440px]">
                        <MinimalStepper step={step} labels={copy.steps} />
                    </div>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                        <div className="rounded-full border border-white/80 bg-white/92 px-3.5 py-2 text-right shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{copy.total}</p>
                            <p className="mt-1 text-base font-heading font-black text-slate-950">{amount}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="rounded-full border border-slate-200 bg-white/92 p-2 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-700 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                            aria-label={copy.close}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div
                className="min-h-0 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div className={`mx-auto min-h-full w-full ${contentMaxWidthClass} px-5 py-4 pb-6 sm:px-6`}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step-1" {...stepTransition} className="space-y-4">
                                <section className="space-y-1.5 border-b border-slate-200 pb-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{focusLabel}</p>
                                    <h1
                                        id="payment-checkout-title"
                                        className="text-[clamp(1.45rem,2.4vw,2rem)] font-heading font-black leading-[1.02] text-slate-950"
                                    >
                                        {headerTitle}
                                    </h1>
                                    <p id="payment-checkout-subtitle" className="max-w-2xl text-sm leading-6 text-slate-600">
                                        {headerDescription}
                                    </p>
                                </section>

                                <section className="space-y-5">
                                    <div className="pb-3">
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{isTr ? "Ürün" : "Product"}</p>
                                        <p className="mt-2 text-[1.7rem] font-black leading-tight text-slate-950">{productName}</p>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{productDesc}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-4">
                                        {productFeatures.map((feature) => (
                                            <div
                                                key={feature}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-950"
                                            >
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#e6c800]" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
                                        <div className="border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.total}</p>
                                            <p className="mt-2 text-[2rem] font-heading font-black leading-none text-slate-950">{amount}</p>
                                            <span className="mt-3 inline-flex rounded-full bg-[#fff4c6] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">
                                                {copy.annual}
                                            </span>
                                        </div>

                                        <label className="block">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.noteLabel}</p>
                                            <textarea
                                                value={note}
                                                onChange={(event) => setNote(event.target.value)}
                                                rows={3}
                                                placeholder={copy.notePlaceholder}
                                                className="mt-3 w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950"
                                            />
                                        </label>
                                    </div>
                                </section>
                            </motion.div>
                        ) : null}

                        {step === 2 ? (
                            <motion.div key="step-2" {...stepTransition} className="space-y-4">
                                <section className="space-y-1.5 border-b border-slate-200 pb-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{focusLabel}</p>
                                    <h1
                                        id="payment-checkout-title"
                                        className="text-[clamp(1.45rem,2.4vw,2rem)] font-heading font-black leading-[1.02] text-slate-950"
                                    >
                                        {headerTitle}
                                    </h1>
                                    <p id="payment-checkout-subtitle" className="max-w-2xl text-sm leading-6 text-slate-600">
                                        {headerDescription}
                                    </p>
                                </section>

                            <section className="grid gap-3 md:grid-cols-2">
                                    {PAYMENT_METHODS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                if (item.enabled) {
                                                    setMethod(item.id);
                                                }
                                            }}
                                            disabled={!item.enabled}
                                            className={`w-full rounded-[1.2rem] border px-4 py-3.5 text-left transition-all ${
                                                method === item.id
                                                    ? "border-slate-950 bg-slate-950 text-white"
                                                    : item.enabled
                                                      ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                                      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${method === item.id ? "text-white/65" : "text-slate-400"}`}>
                                                        {item.enabled ? copy.methodActive : copy.methodSoon}
                                                    </p>
                                                    <p className="mt-1.5 text-base font-black">{isTr ? item.titleTr : item.titleEn}</p>
                                                    <p className={`mt-1.5 text-sm leading-5 ${method === item.id ? "text-white/78" : "text-slate-500"}`}>
                                                        {isTr ? item.descriptionTr : item.descriptionEn}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </section>

                                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <CompactCopyField
                                            label={copy.bank}
                                            value={BANK_TRANSFER_DETAILS.bankName}
                                            copied={copiedField === "bank"}
                                            copyLabel={copy.copyLabel}
                                            copiedLabel={copy.copiedLabel}
                                            onCopy={() => handleCopy("bank", BANK_TRANSFER_DETAILS.bankName)}
                                        />
                                        <CompactCopyField
                                            label={copy.receiver}
                                            value={BANK_TRANSFER_DETAILS.accountHolder}
                                            copied={copiedField === "receiver"}
                                            copyLabel={copy.copyLabel}
                                            copiedLabel={copy.copiedLabel}
                                            onCopy={() => handleCopy("receiver", BANK_TRANSFER_DETAILS.accountHolder)}
                                        />
                                        <CompactCopyField
                                            label={copy.iban}
                                            value={BANK_TRANSFER_DETAILS.ibanDisplay}
                                            copied={copiedField === "iban"}
                                            copyLabel={copy.copyLabel}
                                            copiedLabel={copy.copiedLabel}
                                            mono
                                            onCopy={() => handleCopy("iban", BANK_TRANSFER_DETAILS.ibanRaw)}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-0.5">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.account}</p>
                                            <p className="mt-2 break-all text-sm font-black text-slate-950">
                                                {sessionUser?.email ?? "mail@adresiniz.com"}
                                            </p>
                                            <p className="mt-1.5 text-sm leading-6 text-slate-600">
                                                {isTr ? "Ödeme bildirimi bu hesapla eşleştirilir." : "The payment notice is matched with this account."}
                                            </p>
                                        </div>

                                        <div className="rounded-[1.1rem] border border-[#f1e6a7] bg-[#fffdf7] px-4 py-3 text-sm leading-6 text-slate-700">
                                            <p className="font-black text-slate-950">{isTr ? "Kısa not" : "Quick note"}</p>
                                            <p className="mt-1.5">
                                                {isTr
                                                    ? "Havale yaparken açıklama kısmına hesap e-postanızı ekleyebilirsiniz."
                                                    : "You can add your account email to the transfer description."}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        ) : null}

                        {step === 3 ? (
                            <motion.div key="step-3" {...stepTransition} className="space-y-4">
                                <section className="space-y-1.5 border-b border-slate-200 pb-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{focusLabel}</p>
                                    <h1
                                        id="payment-checkout-title"
                                        className="text-[clamp(1.45rem,2.4vw,2rem)] font-heading font-black leading-[1.02] text-slate-950"
                                    >
                                        {headerTitle}
                                    </h1>
                                    <p id="payment-checkout-subtitle" className="max-w-2xl text-sm leading-6 text-slate-600">
                                        {headerDescription}
                                    </p>
                                </section>

                                {status !== "authenticated" ? (
                                    <section className="space-y-5">
                                        <div>
                                            <p className="text-xl font-black text-slate-950">{copy.authTitle}</p>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">{copy.authDesc}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                href={loginHref}
                                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                                            >
                                                {copy.login}
                                            </Link>
                                            <Link
                                                href={registerHref}
                                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-300"
                                            >
                                                {copy.register}
                                            </Link>
                                        </div>
                                    </section>
                                ) : (
                                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.86fr)] lg:items-start">
                                        <form id={formId} onSubmit={handleSubmit} className="space-y-5">
                                            <div className="border-b border-slate-200 pb-4">
                                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.account}</p>
                                                <p className="mt-1.5 text-base font-black text-slate-950">{sessionUser?.email ?? "-"}</p>
                                            </div>

                                            <div className="border-b border-slate-200 pb-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.receipt}</p>
                                                        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">{copy.receiptHelp}</p>
                                                    </div>
                                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                                        {copy.optional}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                        <UploadCloud size={18} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-black text-slate-950">{copy.receiptHint}</p>
                                                        {fileName ? (
                                                            <p className="mt-2 break-all text-sm font-medium text-slate-600">
                                                                {copy.selectedFile}: <span className="font-black text-slate-950">{fileName}</span>
                                                            </p>
                                                        ) : null}
                                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                                            <label
                                                                htmlFor={receiptInputId}
                                                                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                                                            >
                                                                {isTr ? "Dosya seç" : "Choose file"}
                                                            </label>
                                                            <input
                                                                id={receiptInputId}
                                                                type="file"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                onChange={handleFileChange}
                                                                className="sr-only"
                                                            />
                                                            {!fileName ? (
                                                                <span className="text-sm text-slate-500">
                                                                    {isTr ? "Dekont eklemeden de devam edebilirsiniz." : "You can continue without a receipt."}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <label className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={confirmedTransfer}
                                                    onChange={(event) => {
                                                        setConfirmedTransfer(event.target.checked);
                                                        if (error) {
                                                            setError("");
                                                        }
                                                    }}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                                                />
                                                <span className="text-sm leading-6 text-slate-700">{copy.confirmCheckbox}</span>
                                            </label>

                                            {error ? (
                                                <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                                                    {error}
                                                </div>
                                            ) : null}
                                        </form>

                                        <div className="space-y-5 lg:pt-0.5">
                                            <section>
                                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{copy.nextSteps}</p>
                                                <div className="mt-3 space-y-2.5">
                                                    {[copy.reviewStep, copy.deliveryStep, copy.supportStep].map((item) => (
                                                        <div key={item} className="flex items-start gap-3">
                                                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#e6c800]" />
                                                            <p className="text-sm leading-6 text-slate-700">{item}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section className="border-t border-slate-200 pt-5">
                                                <p className="text-sm leading-6 text-slate-600">{copy.reassurance}</p>
                                                <div className="mt-3 flex items-center gap-3 text-sm font-black text-slate-950">
                                                    <Mail size={16} className="text-slate-400" />
                                                    {PAYMENT_SUPPORT.email}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-[rgba(252,251,247,0.98)] px-5 py-3 backdrop-blur sm:px-6">
                <div className={`mx-auto flex w-full ${contentMaxWidthClass} flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep((prev) => Math.max(1, prev - 1) as Step)}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-300"
                        >
                            <ArrowLeft size={14} />
                            {copy.back}
                        </button>
                    ) : (
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            {copy.total} • {amount}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {step < 3 ? (
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={() => setStep((prev) => Math.min(3, prev + 1) as Step)}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                            >
                                {copy.continue}
                                <ArrowRight size={14} />
                            </motion.button>
                        ) : status === "authenticated" ? (
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                form={formId}
                                disabled={submitting}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                                {submitting ? `${copy.sending}...` : copy.submit}
                            </motion.button>
                        ) : (
                            <Link
                                href={loginHref}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800"
                            >
                                {copy.login}
                                <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                </div>
            </footer>
        </section>
    );
}
