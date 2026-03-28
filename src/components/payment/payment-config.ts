export const PRODUCTS = {
    "legal-toolkit": {
        price: 3000,
        titleTr: "Hukuk Araçları Paketi",
        titleEn: "Legal Toolkit",
        descTr: "UYAP uyumlu belge dönüşümü, PDF araçları, OCR ve toplu işlem modülleri.",
        descEn: "UYAP-friendly document conversion, PDF tools, OCR, and bulk workflow modules.",
        featuresTr: ["11 belge aracı", "1 yıllık erişim", "Sınırsız kullanım"],
        featuresEn: ["11 document tools", "1 year access", "Unlimited usage"],
    },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;

export const PAYMENT_METHODS = [
    {
        id: "bank-transfer",
        titleTr: "Banka Havalesi",
        titleEn: "Bank Transfer",
        descriptionTr: "Anında ödeme bildirimi ile manuel onay akışı",
        descriptionEn: "Manual review flow with instant payment notice",
        enabled: true,
    },
    {
        id: "payment-link",
        titleTr: "Ödeme Linki",
        titleEn: "Payment Link",
        descriptionTr: "İyzico ile tek tık güvenli ödeme yakında",
        descriptionEn: "Secure one-click checkout via Iyzico coming soon",
        enabled: false,
    },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const BANK_TRANSFER_DETAILS = {
    bankName: "Yapı Kredi",
    accountHolder: "Gurkan Yavuz",
    ibanRaw: "TR060006701000000077732201",
    ibanDisplay: "TR06 0006 7010 0000 0077 7322 01",
};

export const PAYMENT_SUPPORT = {
    email: "info@zygsoft.com",
    phone: "+90 542 291 69 12",
};
