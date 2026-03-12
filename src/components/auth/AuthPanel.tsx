"use client";

type AuthPanelProps = {
    children: React.ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg";
};

const maxWidthClass = {
    sm: "max-w-[400px]",
    md: "max-w-[440px]",
    lg: "max-w-[500px]",
};

export function AuthPanel({ children, className = "", maxWidth = "md" }: AuthPanelProps) {
    return (
        <div className={`w-full ${maxWidthClass[maxWidth]} ${className}`}>
            {children}
        </div>
    );
}
