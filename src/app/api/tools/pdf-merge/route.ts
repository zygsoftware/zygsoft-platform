import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PDFDocument } from "pdf-lib";
import { checkToolAccess, incrementTrialUsage } from "@/lib/trial-guard";

export const dynamic = "force-dynamic";

/* ── Limits ─────────────────────────────────────────────────────── */
const MAX_FILES      = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB per PDF

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

        const raw   = formData.getAll("files");
        const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

        /* Validate count */
        if (files.length < 2) {
            return NextResponse.json(
                { error: "Birleştirme için en az 2 PDF dosyası gereklidir." },
                { status: 400 }
            );
        }
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `En fazla ${MAX_FILES} dosya birleştirilebilir.` },
                { status: 400 }
            );
        }

        /* Validate each file */
        for (const file of files) {
            const isPdf =
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf");
            if (!isPdf) {
                return NextResponse.json(
                    { error: `"${file.name}" PDF formatında değil.` },
                    { status: 400 }
                );
            }
            if (file.size > MAX_FILE_BYTES) {
                return NextResponse.json(
                    { error: `"${file.name}" dosyası çok büyük (maks. 20 MB).` },
                    { status: 400 }
                );
            }
        }

        /* Merge */
        const merged = await PDFDocument.create();

        for (const file of files) {
            const bytes = new Uint8Array(await file.arrayBuffer());

            let srcDoc: PDFDocument;
            try {
                srcDoc = await PDFDocument.load(bytes, {
                    // Ignore XFA forms / minor errors so merging still works
                    ignoreEncryption: true,
                });
            } catch {
                return NextResponse.json(
                    { error: `"${file.name}" okunamadı. Dosya şifreli veya bozuk olabilir.` },
                    { status: 422 }
                );
            }

            const pageCount = srcDoc.getPageCount();
            if (pageCount === 0) {
                return NextResponse.json(
                    { error: `"${file.name}" içinde sayfa bulunamadı.` },
                    { status: 422 }
                );
            }

            const copiedPages = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach((page) => merged.addPage(page));
        }

        const pdfBytes = await merged.save();

        if (guard.incrementTrial) {
            incrementTrialUsage(guard.userId).catch(() => {});
        }

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type":        "application/pdf",
                "Content-Disposition": 'attachment; filename="zygsoft_merged.pdf"',
                "Cache-Control":       "no-store",
            },
        });
    } catch (err) {
        console.error("[pdf-merge] Unexpected error", err);
        return NextResponse.json({ error: "Birleştirme sırasında beklenmeyen bir hata oluştu." }, { status: 500 });
    }
}
