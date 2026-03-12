/**
 * Client-side helper to check if user has tool access.
 * ALLOW if: subscription OR (trial active AND not expired AND under limit)
 */
export function hasToolAccess(user: {
    activeProductSlugs?: string[];
    role?: string;
    trialStatus?: string;
    trialEndsAt?: string | Date | null;
    trialOperationsUsed?: number;
    trialOperationsLimit?: number;
} | null | undefined): boolean {
    if (!user) return false;

    const slugs = user.activeProductSlugs || [];
    if (slugs.includes("legal-toolkit") || user.role === "admin") return true;

    if (user.trialStatus !== "active") return false;

    const limit = user.trialOperationsLimit ?? 20;
    const used = user.trialOperationsUsed ?? 0;
    if (used >= limit) return false;

    const endsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    if (endsAt && new Date() > endsAt) return false;

    return true;
}
