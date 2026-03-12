"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export type PrefillFields = {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
};

/**
 * Returns form state and onChange that prefills from session on initial render.
 * Once user edits a field, we don't overwrite it.
 */
export function usePrefillUserFields<T extends PrefillFields>(
    initial: T,
    keys: (keyof T)[] = ["name", "email", "phone", "company"]
): [T, (key: keyof T, value: string) => void, (values?: Partial<T>) => void] {
    const { data: session } = useSession();
    const [form, setForm] = useState<T>(initial);
    const hasPrefilled = useRef(false);
    const userEdited = useRef<Set<keyof T>>(new Set());

    useEffect(() => {
        if (hasPrefilled.current || !session?.user) return;
        const user = session.user as any;
        const updates: Partial<T> = {};
        let changed = false;
        for (const key of keys) {
            if (userEdited.current.has(key)) continue;
            const val = user[key];
            if (val != null && String(val).trim()) {
                updates[key] = String(val).trim() as T[keyof T];
                changed = true;
            }
        }
        if (changed) {
            setForm((prev) => ({ ...prev, ...updates }));
            hasPrefilled.current = true;
        }
    }, [session?.user]);

    const onChange = (key: keyof T, value: string) => {
        userEdited.current.add(key);
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const reset = (values?: Partial<T>) => {
        userEdited.current.clear();
        hasPrefilled.current = false;
        setForm(values ? { ...initial, ...values } : initial);
    };

    return [form, onChange, reset];
}
