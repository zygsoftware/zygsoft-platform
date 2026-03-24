import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
    buildStorageObjectPath,
    removeFromStorage,
    storageBuckets,
    uploadToStorage,
} from "@/lib/supabase-storage";
import { formatMbLimit, getToolMaxFileBytes, hasPaidLegalToolkitAccess } from "@/lib/tool-policy";

const ALLOWED_EXT = [".udf", ".xml"];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        if (!hasPaidLegalToolkitAccess(session.user as any)) {
            return NextResponse.json({ hasLetterhead: false });
        }

        const letterhead = await prisma.userLetterhead.findUnique({
            where: { userId: session.user.id },
        });

        if (!letterhead) {
            return NextResponse.json({ hasLetterhead: false });
        }

        return NextResponse.json({ hasLetterhead: Boolean(letterhead.filePath) });
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

        if (!hasPaidLegalToolkitAccess(session.user as any)) {
            return NextResponse.json({
                error: "Bu özellik için aktif Hukuk Araçları Paketi aboneliği ve doğrulanmış e-posta gereklidir.",
            }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !(file instanceof Blob) || file.size === 0) {
            return NextResponse.json({ error: "Dosya eksik veya geçersiz." }, { status: 400 });
        }

        const maxFileBytes = getToolMaxFileBytes("letterhead", true, {
            name: file.name || "letterhead.xml",
            type: file.type || "application/octet-stream",
        });
        if (maxFileBytes !== null && file.size > maxFileBytes) {
            return NextResponse.json({ error: `Antet dosyası en fazla ${formatMbLimit(maxFileBytes)} olabilir.` }, { status: 400 });
        }

        const name = (file.name || "").toLowerCase();
        const ext = ALLOWED_EXT.find((e) => name.endsWith(e));
        if (!ext) {
            return NextResponse.json({
                error: "Sadece .udf veya .xml dosyaları desteklenmektedir.",
            }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const objectPath = buildStorageObjectPath([session.user.id, `letterhead${ext}`]);
        const existing = await prisma.userLetterhead.findUnique({
            where: { userId: session.user.id },
        });

        if (existing?.filePath && existing.filePath !== objectPath) {
            await removeFromStorage(storageBuckets.letterheads, [existing.filePath]).catch(() => {});
        }

        await uploadToStorage({
            bucket: storageBuckets.letterheads,
            objectPath,
            body: new Uint8Array(buffer),
            contentType: file.type || "application/octet-stream",
            upsert: true,
        });

        await prisma.userLetterhead.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id, filePath: objectPath },
            update: { filePath: objectPath },
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
            if (letterhead.filePath) {
                await removeFromStorage(storageBuckets.letterheads, [letterhead.filePath]).catch(() => {});
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
