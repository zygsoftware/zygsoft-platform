export type ConsentState = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
    updatedAt: string;
};

export const CONSENT_STORAGE_KEY = "zygsoft_cookie_consent";

export function buildConsentState(
    input: Pick<ConsentState, "analytics" | "marketing">,
): ConsentState {
    return {
        necessary: true,
        analytics: input.analytics,
        marketing: input.marketing,
        updatedAt: new Date().toISOString(),
    };
}
