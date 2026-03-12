import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";

export const dynamic = "force-dynamic";

/* ── Limits ─────────────────────────────────────────────────────── */
const MAX_FILES      = 10;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per image

/* Supported MIME types — pdf-lib embedJpg / embedPng only */
const ALLOWED: Record<string, "jpg" | "png"> = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
};

/* ── A4 page dimensions in points (72 dpi) ─────────────────────── */
const A4_W = 595.28;
const A4_H = 841.89;

function fitIntoA4(imgW: number, imgH: number): { x: number; y: number; w: number; h: number } {
    const scale = Math.min(A4_W / imgW, A4_H / imgH, 1); // never upscale
    const w = imgW * scale;
    const h = imgH * scale;
    return { x: (A4_W - w) / 2, y: (A4_H - h) / 2, w, h };
}

/* ── Route handler ──────────────────────────────────────────────── */
export async function POST(req: Request) {
    try {
        const guard = await checkToolAccess();
        if (!guard.allowed) return guard.response;

        const session = await getServerSession(authOptions);
        /* Parse multipart */
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json({ error: "Form verisi okunamadı." }, { status: 400 });
        }

        const raw = formData.getAll("files");
        const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

        /* Validate count */
        if (files.length === 0) {
            return NextResponse.json({ error: "En az bir resim dosyası gereklidir." }, { status: 400 });
        }
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.` },
                { status: 400 }
            );
        }

        /* Validate each file */
        for (const file of files) {
            const kind = ALLOWED[file.type];
            if (!kind) {
                const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
                const byExt = ext === "jpg" || ext === "jpeg" ? "jpg" : ext === "png" ? "png" : null;
                if (!byExt) {
                    return NextResponse.json(
                        { error: `"${file.name}" desteklenmeyen formatta. Yalnızca JPG ve PNG kabul edilir.` },
                        { status: 400 }
                    );
                }
            }
            if (file.size > MAX_FILE_BYTES) {
                return NextResponse.json(
                    { error: `"${file.name}" dosyası çok büyük (maks. 8 MB).` },
                    { status: 400 }
                );
            }
        }

        /* Build PDF */
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
            const bytes    = new Uint8Array(await file.arrayBuffer());
            const mimeKind = ALLOWED[file.type];
            const extKind  = (() => {
                const ext = file.name.split(".").pop()?.toLowerCase();
                return ext === "png" ? "png" : "jpg";
            })();
            const kind = mimeKind ?? extKind;

            let embeddedImage;
            try {
                embeddedImage = kind === "png"
                    ? await pdfDoc.embedPng(bytes)
                    : await pdfDoc.embedJpg(bytes);
            } catch {
                return NextResponse.json(
                    { error: `"${file.name}" dosyası okunamadı veya bozuk olabilir.` },
                    { status: 422 }
                );
            }

            /* Place image centred on an A4 page */
            const page = pdfDoc.addPage([A4_W, A4_H]);
            const { x, y, w, h } = fitIntoA4(embeddedImage.width, embeddedImage.height);
            page.drawImage(embeddedImage, { x, y, width: w, height: h });
        }

        const pdfBytes = await pdfDoc.save();

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type":        "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_pdf_kitapcigi.pdf"',
                "Cache-Control":       "no-store",
            },
        });
    } catch (err) {
        console.error("[image-to-pdf] Unexpected error", err);
        return NextResponse.json({ error: "PDF oluşturulurken beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
