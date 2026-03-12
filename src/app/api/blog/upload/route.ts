import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "Dosya yüklenmedi." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Geçersiz dosya türü. JPEG, PNG, WebP veya GIF kabul edilir." }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Dosya boyutu 5MB'dan küçük olmalıdır." }, { status: 400 });
        }

        const ext = path.extname(file.name) || ".jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "blog");
        await mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        const url = `/uploads/blog/${filename}`;
        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 500 });
    }
}
