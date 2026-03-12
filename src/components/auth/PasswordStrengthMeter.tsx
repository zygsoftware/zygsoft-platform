"use client";

type Strength = "weak" | "fair" | "good" | "strong";

function getStrength(password: string): Strength {
    if (!password) return "weak";
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 1) return "weak";
    if (score <= 2) return "fair";
    if (score <= 4) return "good";
    return "strong";
}

const labels: Record<Strength, string> = {
    weak: "Zayıf",
    fair: "Orta",
    good: "İyi",
    strong: "Güçlü",
};

const colors: Record<Strength, string> = {
    weak: "bg-red-400",
    fair: "bg-amber-500",
    good: "bg-[#e6c800]",
    strong: "bg-emerald-500",
};

type PasswordStrengthMeterProps = {
    password: string;
    locale?: "tr" | "en";
};

export function PasswordStrengthMeter({ password, locale = "tr" }: PasswordStrengthMeterProps) {
    const strength = getStrength(password);
    if (!password) return null;

    const width = strength === "weak" ? 25 : strength === "fair" ? 50 : strength === "good" ? 75 : 100;

    return (
        <div className="mt-1.5" role="status" aria-live="polite">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${colors[strength]} rounded-full transition-all duration-300`}
                        style={{ width: `${width}%` }}
                    />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {locale === "en" ? strength : labels[strength]}
                </span>
            </div>
        </div>
    );
}
