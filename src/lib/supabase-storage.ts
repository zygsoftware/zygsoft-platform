const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storageBuckets = {
    blog: process.env.SUPABASE_STORAGE_BLOG_BUCKET || "blog-images",
    projects: process.env.SUPABASE_STORAGE_PROJECT_BUCKET || "project-images",
    letterheads: process.env.SUPABASE_STORAGE_LETTERHEAD_BUCKET || "letterheads",
    payments: process.env.SUPABASE_STORAGE_PAYMENT_BUCKET || "payment-receipts",
} as const;

function requireStorageEnv(): { url: string; key: string } {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    }

    return { url: supabaseUrl.replace(/\/$/, ""), key: supabaseServiceRoleKey };
}

function encodeObjectPath(objectPath: string): string {
    return objectPath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}

function objectUrl(bucket: string, objectPath: string, isPublic: boolean): string {
    const { url } = requireStorageEnv();
    const route = isPublic ? "public" : "object";
    return isPublic
        ? `${url}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`
        : `${url}/storage/v1/object/${bucket}/${encodeObjectPath(objectPath)}`;
}

async function storageRequest(
    input: string,
    init: RequestInit = {},
): Promise<Response> {
    const { key } = requireStorageEnv();
    const headers = new Headers(init.headers);
    headers.set("apikey", key);
    headers.set("Authorization", `Bearer ${key}`);

    return fetch(input, {
        ...init,
        headers,
    });
}

export function buildStorageObjectPath(parts: string[]): string {
    return parts
        .map((part) => part.trim())
        .filter(Boolean)
        .join("/");
}

export function getPublicStorageUrl(bucket: string, objectPath: string): string {
    return objectUrl(bucket, objectPath, true);
}

export async function uploadToStorage(params: {
    bucket: string;
    objectPath: string;
    body: Uint8Array;
    contentType: string;
    upsert?: boolean;
}): Promise<{ objectPath: string; publicUrl: string }> {
    const { url } = requireStorageEnv();
    const normalizedBody = params.body.slice().buffer;
    const response = await storageRequest(
        `${url}/storage/v1/object/${params.bucket}/${encodeObjectPath(params.objectPath)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": params.contentType,
                "x-upsert": params.upsert ? "true" : "false",
            },
            body: new Blob([normalizedBody], { type: params.contentType }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Storage upload failed: ${response.status} ${errorText}`);
    }

    return {
        objectPath: params.objectPath,
        publicUrl: getPublicStorageUrl(params.bucket, params.objectPath),
    };
}

export async function removeFromStorage(bucket: string, objectPaths: string[]): Promise<void> {
    if (objectPaths.length === 0) return;

    const { url } = requireStorageEnv();
    const response = await storageRequest(`${url}/storage/v1/object/${bucket}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: objectPaths }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Storage delete failed: ${response.status} ${errorText}`);
    }
}

export async function downloadFromStorage(bucket: string, objectPath: string): Promise<Buffer> {
    const response = await storageRequest(objectUrl(bucket, objectPath, false), {
        method: "GET",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Storage download failed: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
