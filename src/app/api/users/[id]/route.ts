import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const params = await props.params;
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                status: true,
                phone: true,
                company: true,
                locale: true,
                notes: true,
                lastLoginAt: true,
                createdAt: true,
                emailVerified: true,
                trialStatus: true,
                trialStartedAt: true,
                trialEndsAt: true,
                trialOperationsUsed: true,
                trialOperationsLimit: true,
                subscriptions: {
                    include: { product: true },
                    orderBy: { createdAt: "desc" },
                },
                payments: { take: 20, orderBy: { createdAt: "desc" }, include: { product: true } },
                supportTickets: { orderBy: { createdAt: "desc" } },
                blogComments: { take: 10, orderBy: { created_at: "desc" }, include: { post: { select: { slug: true, title_tr: true, title_en: true } } } },
                _count: { select: { blogComments: true, blogLikes: true, supportTickets: true } },
                passwordResetTokens: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    select: { id: true, createdAt: true, usedAt: true, expiresAt: true },
                },
            },
        });

        if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const params = await props.params;
        const body = await req.json();

        const { name, email, role, status, phone, company, locale, notes } = body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;
        if (phone !== undefined) updateData.phone = phone;
        if (company !== undefined) updateData.company = company;
        if (locale !== undefined) updateData.locale = locale;
        if (notes !== undefined) updateData.notes = notes;

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("USER_UPDATE_ERROR", error);
        return NextResponse.json({ error: "Kullanıcı güncellenemedi." }, { status: 500 });
    }
}
