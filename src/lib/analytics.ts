"use client";

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
    }
}

type AnalyticsPayload = Record<string, unknown>;

export function pushDataLayerEvent(event: string, payload: AnalyticsPayload = {}) {
    if (typeof window === "undefined") {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event,
        ...payload,
    });
}

export function pushLeadEvent(payload: AnalyticsPayload = {}) {
    pushDataLayerEvent("generate_lead", payload);
}

export function pushTrialStartEvent(payload: AnalyticsPayload = {}) {
    pushDataLayerEvent("start_trial", payload);
}
