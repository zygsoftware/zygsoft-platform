import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mail";
import { contactRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    // Rate limit: 5 requests per 10 minutes per IP
    const rl = contactRateLimit(request);
    if (rl.limited) {
        return NextResponse.json(
            { error: "Çok fazla istek gönderildi. Lütfen birkaç dakika sonra tekrar deneyin." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { name, email, phone, company, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Ad, e-posta, konu ve mesaj alanlari zorunludur." },
                { status: 400 }
            );
        }

        // Length limits
        if (String(name).trim().length > 200) {
            return NextResponse.json({ error: "Ad alanı çok uzun (maks. 200 karakter)." }, { status: 400 });
        }
        if (String(subject).trim().length > 300) {
            return NextResponse.json({ error: "Konu alanı çok uzun (maks. 300 karakter)." }, { status: 400 });
        }
        if (String(message).trim().length > 5000) {
            return NextResponse.json({ error: "Mesaj çok uzun (maks. 5000 karakter)." }, { status: 400 });
        }
        if (phone && String(phone).trim().length > 30) {
            return NextResponse.json({ error: "Telefon numarası çok uzun." }, { status: 400 });
        }
        if (company && String(company).trim().length > 200) {
            return NextResponse.json({ error: "Şirket adı çok uzun (maks. 200 karakter)." }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        if (normalizedEmail.length > 254) {
            return NextResponse.json({ error: "E-posta adresi çok uzun." }, { status: 400 });
        }
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
        if (!isEmailValid) {
            return NextResponse.json(
                { error: "Lutfen gecerli bir e-posta adresi girin." },
                { status: 400 }
            );
        }

        const composedMessage = company
            ? `Sirket: ${String(company).trim()}\n\n${String(message).trim()}`
            : String(message).trim();

        const newMessage = await prisma.contactMessage.create({
            data: {
                name: String(name).trim(),
                email: normalizedEmail,
                phone: phone ? String(phone).trim() : null,
                subject: String(subject).trim(),
                message: composedMessage,
            },
        });

        // Secondary: email notification — failure must NOT fail the request
        try {
            await sendContactNotification({
                name:      String(name).trim(),
                email:     normalizedEmail,
                phone:     phone ? String(phone).trim() : null,
                subject:   subject ? String(subject).trim() : null,
                message:   composedMessage,
                createdAt: newMessage.createdAt,
            });
        } catch (emailError) {
            console.error("[contact] Email notification failed (submission was saved):", emailError);
        }

        return NextResponse.json(
            { message: "Mesajiniz basariyla iletildi.", id: newMessage.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Contact API Error:", error);
        return NextResponse.json(
            { error: "Mesaj iletilirken bir hata olustu." },
            { status: 500 }
        );
    }
}
