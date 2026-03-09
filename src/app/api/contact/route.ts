import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, company, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Ad, e-posta, konu ve mesaj alanlari zorunludur." },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).trim().toLowerCase();
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
