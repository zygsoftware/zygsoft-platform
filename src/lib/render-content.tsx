import React from "react";

const BULLET_PATTERN = /^[\s]*[•\-–*]\s*/;
const INLINE_BULLET = /\s*[•\-–*]\s+/;

/**
 * Splits text by newlines and inline bullets, trims, removes leading bullet symbols,
 * and returns items suitable for rendering as a list.
 * Supports intro paragraph + bullet list.
 * Handles: "• item1\n• item2" and "• item1 • item2 • item3" (inline).
 */
export function parseStructuredList(text: string | null | undefined): { intro: string | null; items: string[] } {
    if (!text?.trim()) return { intro: null, items: [] };

    const raw = text.trim();
    const items: string[] = [];
    let intro: string | null = null;

    // First split by newlines
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        const bulletMatch = line.match(BULLET_PATTERN);
        const hasInlineBullets = INLINE_BULLET.test(line) && line.split(INLINE_BULLET).length > 1;

        // Multiple bullets on one line: "• a • b • c"
        if (hasInlineBullets) {
            const parts = line.split(INLINE_BULLET).map((p) => p.trim()).filter(Boolean);
            for (const p of parts) items.push(p);
            continue;
        }

        const cleaned = bulletMatch ? line.replace(BULLET_PATTERN, "").trim() : line;
        if (!cleaned) continue;

        // Line starts with bullet-like marker → list item
        if (bulletMatch) {
            items.push(cleaned);
            continue;
        }

        // Non-bullet: before any items → intro; after items → treat as item
        if (items.length === 0) {
            intro = intro ? `${intro} ${cleaned}` : cleaned;
        } else {
            items.push(cleaned);
        }
    }

    return { intro, items };
}

type StructuredContentProps = {
    text: string | null | undefined;
    className?: string;
    listClassName?: string;
    itemClassName?: string;
};

/**
 * Renders structured text with optional intro paragraph and proper bullet list.
 * Use for problem_tr/en, solution_tr/en, process_tr/en, result_tr/en fields.
 */
export function StructuredContent({
    text,
    className = "",
    listClassName = "list-disc pl-6 space-y-2",
    itemClassName = "leading-7 text-[15px] text-slate-700",
}: StructuredContentProps) {
    const { intro, items } = parseStructuredList(text);

    if (!intro && items.length === 0) return null;

    return (
        <div className={className}>
            {intro && (
                <p className="text-[#555] leading-relaxed mb-4">{intro}</p>
            )}
            {items.length > 0 && (
                <ul className={listClassName}>
                    {items.map((item, i) => (
                        <li key={i} className={itemClassName}>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
