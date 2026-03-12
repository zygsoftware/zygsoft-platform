import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { supportRateLimit } from "@/lib/rate-limit";
import { generateTicketCode } from "@/lib/support-ticket";
import { sendSupportTicketCreatedEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

/* ── GET — current user's own tickets ── */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const tickets = await prisma.supportTicket.findMany({
            where:   { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ tickets, total: tickets.length });
    } catch (error) {
        console.error("[support] GET error", error);
        return NextResponse.json({ error: "Destek talepleri alınırken hata oluştu." }, { status: 500 });
    }
}

/* ── POST — create a new ticket ── */
export async function POST(req: Request) {
    // Rate limit: 10 requests per 60 minutes per IP (authentication is a secondary guard)
    const rl = supportRateLimit(req);
    if (rl.limited) {
        return NextResponse.json(
            { error: "Çok fazla talep gönderildi. Lütfen bir saat sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { emailVerified: true, email: true, locale: true },
        });
        if (!user?.email) {
            return NextResponse.json({ error: "Kullanıcı bilgisi bulunamadı." }, { status: 401 });
        }
        if (!user.emailVerified && (session.user as any).role !== "admin") {
            return NextResponse.json(
                { error: "Destek talebi oluşturmak için e-posta adresinizi doğrulamanız gerekiyor." },
                { status: 403 }
            );
        }

        const { subject, message } = await req.json();

        if (!subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "Konu ve mesaj alanları zorunludur." },
                { status: 400 }
            );
        }

        if (subject.trim().length > 300) {
            return NextResponse.json({ error: "Konu çok uzun (maks. 300 karakter)." }, { status: 400 });
        }
        if (message.trim().length > 5000) {
            return NextResponse.json({ error: "Mesaj çok uzun (maks. 5000 karakter)." }, { status: 400 });
        }

        const ticketCode = await generateTicketCode();
        const ticket = await prisma.supportTicket.create({
            data: {
                userId:     session.user.id,
                subject:    subject.trim(),
                message:    message.trim(),
                status:     "open",
                ticketCode,
            },
        });

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const locale = (user.locale === "en" ? "en" : "tr") as "tr" | "en";
        const pathPrefix = locale === "en" ? "/en" : "";
        const panelLink = `${siteUrl}${pathPrefix}/dashboard/support`;

        sendSupportTicketCreatedEmail({
            toEmail:   user.email,
            ticketCode,
            subject:   subject.trim(),
            createdAt: ticket.createdAt,
            panelLink,
            locale,
        }).catch((err) => console.error("[support] Mail send failed:", err));

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error) {
        console.error("[support] POST error", error);
        return NextResponse.json({ error: "Talep oluşturulurken hata oluştu." }, { status: 500 });
    }
}
