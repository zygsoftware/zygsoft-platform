import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            select: { id: true, published: true },
        });

        if (!post || !post.published) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.blogPost.update({
            where: { id: params.id },
            data: { view_count: { increment: 1 } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "View count failed" }, { status: 500 });
    }
}
