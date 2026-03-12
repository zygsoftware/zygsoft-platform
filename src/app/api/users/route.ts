import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim().toLowerCase();
        const role = searchParams.get("role");
        const status = searchParams.get("status");
        const locale = searchParams.get("locale");
        const sort = searchParams.get("sort") || "newest";

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
        }
        if (role && role !== "all") where.role = role;
        if (status && status !== "all") where.status = status;
        if (locale && locale !== "all") where.locale = locale;

        const orderBy =
            sort === "lastLogin"
                ? [{ lastLoginAt: "desc" as const }, { createdAt: "desc" as const }]
                : sort === "active"
                    ? [{ lastLoginAt: "desc" as const }, { createdAt: "desc" as const }]
                    : [{ createdAt: "desc" as const }];

        const users = await prisma.user.findMany({
            where,
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
                lastLoginAt: true,
                notes: true,
                createdAt: true,
                emailVerified: true,
                trialStatus: true,
                trialStartedAt: true,
                trialEndsAt: true,
                trialOperationsUsed: true,
                trialOperationsLimit: true,
                _count: {
                    select: {
                        subscriptions: true,
                        payments: true,
                        supportTickets: true,
                        blogComments: true,
                        blogLikes: true,
                    },
                },
            },
            orderBy,
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

        // Prevent admin from deleting themselves
        if (id === (session.user as any).id) {
            return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
        }

        // Delete related records first (SupportTicket has no onDelete)
        await prisma.supportTicket.deleteMany({ where: { userId: id } });
        await prisma.payment.deleteMany({ where: { userId: id } });
        await prisma.subscription.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: "Kullanıcı silindi." });
    } catch (error) {
        console.error("USER_DELETE_ERROR", error);
        return NextResponse.json({ error: "Kullanıcı silinemedi." }, { status: 500 });
    }
}
