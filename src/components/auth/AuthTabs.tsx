"use client";

type Tab = { id: string; label: string };

type AuthTabsProps = {
    tabs: Tab[];
    active: string;
    onChange: (id: string) => void;
};

export function AuthTabs({ tabs, active, onChange }: AuthTabsProps) {
    return (
        <div className="flex bg-zinc-100 rounded-xl p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                        active === tab.id
                            ? "bg-white text-[#0a0c10] shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
