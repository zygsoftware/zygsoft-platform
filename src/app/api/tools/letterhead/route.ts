import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const LETTERHEAD_DIR = path.join(process.cwd(), "uploads", "letterheads");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = [".udf", ".xml"];

function getLetterheadPath(userId: string): string {
    return path.join(LETTERHEAD_DIR, userId, "letterhead");
}

async function ensureLetterheadDir(userId: string): Promise<string> {
    const dir = path.join(LETTERHEAD_DIR, userId);
    await mkdir(dir, { recursive: true });
    return dir;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";
        if (!activeSlugs.includes("legal-toolkit") && !isAdmin) {
            return NextResponse.json({ hasLetterhead: false });
        }

        const letterhead = await prisma.userLetterhead.findUnique({
            where: { userId: session.user.id },
        });

        if (!letterhead) {
            return NextResponse.json({ hasLetterhead: false });
        }

        const basePath = getLetterheadPath(session.user.id);
        const hasFile = ALLOWED_EXT.some((ext) => existsSync(basePath + ext));

        return NextResponse.json({ hasLetterhead: hasFile });
    } catch (err) {
        console.error("[letterhead] GET error:", err);
        return NextResponse.json({ hasLetterhead: false });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const activeSlugs = (session.user as any).activeProductSlugs || [];
        const isAdmin = (session.user as any).role === "admin";
        if (!activeSlugs.includes("legal-toolkit") && !isAdmin) {
            return NextResponse.json({
                error: "Bu özellik için Hukuk Araçları Paketi aboneliği gereklidir.",
            }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !(file instanceof Blob) || file.size === 0) {
            return NextResponse.json({ error: "Dosya eksik veya geçersiz." }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Antet dosyası en fazla 5 MB olabilir." }, { status: 400 });
        }

        const name = (file.name || "").toLowerCase();
        const ext = ALLOWED_EXT.find((e) => name.endsWith(e));
        if (!ext) {
            return NextResponse.json({
                error: "Sadece .udf veya .xml dosyaları desteklenmektedir.",
            }, { status: 400 });
        }

        const dir = await ensureLetterheadDir(session.user.id);
        const filePath = path.join(dir, `letterhead${ext}`);

        // Remove previous letterhead (different extension) if any
        const basePath = getLetterheadPath(session.user.id);
        for (const e of ALLOWED_EXT) {
            if (e !== ext) {
                const p = basePath + e;
                if (existsSync(p)) {
                    await unlink(p);
                }
            }
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        await prisma.userLetterhead.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id, filePath },
            update: { filePath },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[letterhead] POST error:", err);
        return NextResponse.json({
            error: err.message || "Antet yüklenirken hata oluştu.",
        }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const letterhead = await prisma.userLetterhead.findUnique({
            where: { userId: session.user.id },
        });

        if (letterhead) {
            const basePath = getLetterheadPath(session.user.id);
            for (const ext of ALLOWED_EXT) {
                const p = basePath + ext;
                if (existsSync(p)) {
                    await unlink(p);
                }
            }
            await prisma.userLetterhead.delete({
                where: { userId: session.user.id },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[letterhead] DELETE error:", err);
        return NextResponse.json({
            error: err.message || "Antet silinirken hata oluştu.",
        }, { status: 500 });
    }
}
