"use client";

type AuthDividerProps = {
    children?: React.ReactNode;
};

export function AuthDivider({ children }: AuthDividerProps) {
    if (children) {
        return (
            <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{children}</span>
                <div className="flex-1 h-px bg-zinc-200" />
            </div>
        );
    }
    return <div className="h-px bg-zinc-200 my-8" />;
}
