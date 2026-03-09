import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Ad, e-posta ve mesaj alanları zorunludur.' },
                { status: 400 }
            );
        }

        const newMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject: subject || null,
                message,
            },
        });

        return NextResponse.json(
            { message: 'Mesajınız başarıyla iletildi.', id: newMessage.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Mesaj iletilirken bir hata oluştu.' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
