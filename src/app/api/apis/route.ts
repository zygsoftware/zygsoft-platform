import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

export async function GET(req: Request) {
    try {
        const apis = await prisma.apiConnection.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(apis);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch APIs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const body = await req.json();
        const { name, endpoint, apiKey, status } = body;

        const newApi = await prisma.apiConnection.create({
            data: { name, endpoint, apiKey, status: status || "active" },
        });
        return NextResponse.json(newApi);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create API connection" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

        await prisma.apiConnection.delete({ where: { id } });
        return NextResponse.json({ message: "Silindi" });
    } catch (error) {
        return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
    }
}
