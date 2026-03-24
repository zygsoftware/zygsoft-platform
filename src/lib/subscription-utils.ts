const DIGITAL_PRODUCT_SLUGS = new Set(["legal-toolkit"]);

export function isDigitalProductSlug(slug: string | null | undefined): boolean {
    if (!slug) return false;
    return DIGITAL_PRODUCT_SLUGS.has(String(slug).trim());
}

export function getSubscriptionEndDate(
    billingPeriod: string | null | undefined,
    fromDate: Date = new Date()
): Date {
    const endDate = new Date(fromDate);

    if (billingPeriod === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
        return endDate;
    }

    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
}

export function isSubscriptionCurrentlyActive(
    status: string | null | undefined,
    endsAt: Date | string | null | undefined
): boolean {
    if (status !== "active") return false;
    if (!endsAt) return true;
    return new Date(endsAt) >= new Date();
}
