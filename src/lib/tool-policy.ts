const MB = 1024 * 1024;

export const PAID_PDF_MAX_FILE_BYTES = 500 * MB;

type ToolSlug =
    | "batch-convert"
    | "doc-to-udf"
    | "image-to-pdf"
    | "letterhead"
    | "ocr-text"
    | "pdf-compress"
    | "pdf-merge"
    | "pdf-split"
    | "pdf-to-image"
    | "pdf-to-word"
    | "tiff-to-pdf";

type ToolPolicy = {
    demoMaxFiles?: number | null;
    paidMaxFiles?: number | null;
    demoDefaultMaxFileBytes?: number | null;
    demoPdfMaxFileBytes?: number | null;
    paidDefaultMaxFileBytes?: number | null;
    paidPdfMaxFileBytes?: number | null;
};

const TOOL_POLICIES: Record<ToolSlug, ToolPolicy> = {
    "batch-convert": {
        demoMaxFiles: 20,
        paidMaxFiles: null,
        demoDefaultMaxFileBytes: 20 * MB,
        demoPdfMaxFileBytes: 20 * MB,
        paidDefaultMaxFileBytes: null,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "doc-to-udf": {
        demoDefaultMaxFileBytes: 20 * MB,
        paidDefaultMaxFileBytes: null,
    },
    "image-to-pdf": {
        demoMaxFiles: 10,
        paidMaxFiles: null,
        demoDefaultMaxFileBytes: 8 * MB,
        paidDefaultMaxFileBytes: null,
    },
    "letterhead": {
        demoDefaultMaxFileBytes: 5 * MB,
        paidDefaultMaxFileBytes: null,
    },
    "ocr-text": {
        demoDefaultMaxFileBytes: 20 * MB,
        demoPdfMaxFileBytes: 20 * MB,
        paidDefaultMaxFileBytes: null,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "pdf-compress": {
        demoPdfMaxFileBytes: 20 * MB,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "pdf-merge": {
        demoMaxFiles: 10,
        paidMaxFiles: null,
        demoPdfMaxFileBytes: 20 * MB,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "pdf-split": {
        demoPdfMaxFileBytes: 20 * MB,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "pdf-to-image": {
        demoPdfMaxFileBytes: 20 * MB,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "pdf-to-word": {
        demoPdfMaxFileBytes: 20 * MB,
        paidPdfMaxFileBytes: PAID_PDF_MAX_FILE_BYTES,
    },
    "tiff-to-pdf": {
        demoMaxFiles: 10,
        paidMaxFiles: null,
        demoDefaultMaxFileBytes: 15 * MB,
        paidDefaultMaxFileBytes: null,
    },
};

export function hasPaidLegalToolkitAccess(user: {
    activeProductSlugs?: string[];
    role?: string;
    emailVerified?: boolean | null;
} | null | undefined): boolean {
    if (!user) return false;
    if (user.role === "admin") return true;
    return Boolean(user.emailVerified) && (user.activeProductSlugs || []).includes("legal-toolkit");
}

export function getToolMaxFiles(toolSlug: ToolSlug, hasPaidAccess: boolean): number | null {
    const policy = TOOL_POLICIES[toolSlug];
    return hasPaidAccess ? (policy.paidMaxFiles ?? null) : (policy.demoMaxFiles ?? null);
}

export function getToolMaxFileBytes(
    toolSlug: ToolSlug,
    hasPaidAccess: boolean,
    file: Pick<File, "name" | "type"> | { name: string; type?: string | null }
): number | null {
    const policy = TOOL_POLICIES[toolSlug];
    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");

    if (hasPaidAccess) {
        if (isPdf) return policy.paidPdfMaxFileBytes ?? null;
        return policy.paidDefaultMaxFileBytes ?? null;
    }

    if (isPdf) return policy.demoPdfMaxFileBytes ?? null;
    return policy.demoDefaultMaxFileBytes ?? null;
}

export function formatMbLimit(limitBytes: number): string {
    return `${Math.round(limitBytes / MB)} MB`;
}
