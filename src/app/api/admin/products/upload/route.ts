import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildStorageObjectPath, storageBuckets, uploadToStorage } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

type AdminSessionUser = {
    role?: string;
};

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as AdminSessionUser | undefined)?.role === "admin";
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Görsel yüklenmedi." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz." }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Görsel boyutu 5MB'dan küçük olmalıdır." }, { status: 400 });
        }

        const ext = path.extname(file.name) || ".jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
        const objectPath = buildStorageObjectPath(["products", filename]);
        const bytes = await file.arrayBuffer();

        const uploaded = await uploadToStorage({
            bucket: storageBuckets.projects,
            objectPath,
            body: new Uint8Array(bytes),
            contentType: file.type,
            upsert: false,
        });

        return NextResponse.json({
            url: uploaded.publicUrl,
            path: uploaded.objectPath,
        });
    } catch (error) {
        console.error("ADMIN_PRODUCT_UPLOAD_ERROR", error);
        return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 500 });
    }
}
