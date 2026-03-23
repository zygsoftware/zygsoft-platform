import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendMailTest } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === "admin";

    if (!isAdmin) {
        return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 403 });
    }

    let body: { toEmail?: string } = {};
    try {
        body = await req.json().catch(() => ({}));
    } catch {
        body = {};
    }

    const fallbackEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    const toEmail = String(body.toEmail || fallbackEmail || "").trim().toLowerCase();

    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
        return NextResponse.json({ error: "Gecerli bir test e-posta adresi gerekli." }, { status: 400 });
    }

    try {
        await sendMailTest({ toEmail });
        return NextResponse.json({ success: true, message: `Test e-postasi gonderildi: ${toEmail}` });
    } catch (error) {
        console.error("[mail-test]", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Test e-postasi gonderilemedi." },
            { status: 500 },
        );
    }
}
