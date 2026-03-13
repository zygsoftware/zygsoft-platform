import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function slugRegex() {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
}

function toNull(v: unknown): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
}

function toIntOrNull(v: unknown): number | null {
    if (v === "" || v === undefined || v === null) return null;
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return isNaN(n) ? null : n;
}

function toDateOrNull(v: unknown): Date | null {
    if (v === undefined || v === null || v === "") return null;
    const d = new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
}

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user && (session.user as any).role === "admin";
}

const PROJECT_UPDATE_FIELDS = [
    "slug", "title_tr", "title_en", "excerpt_tr", "excerpt_en", "content_tr", "content_en",
    "category_id", "sector", "service_type", "technologies", "client_name", "is_anonymous_client",
    "project_date", "cover_image", "cover_image_alt_tr", "cover_image_alt_en",
    "cover_image_title_tr", "cover_image_title_en", "cover_image_caption_tr", "cover_image_caption_en",
    "problem_tr", "problem_en", "solution_tr", "solution_en", "process_tr", "process_en",
    "result_tr", "result_en",
    "metric_label_1_tr", "metric_label_1_en", "metric_value_1",
    "metric_label_2_tr", "metric_label_2_en", "metric_value_2",
    "metric_label_3_tr", "metric_label_3_en", "metric_value_3",
    "live_url", "demo_url", "github_url",
    "seo_title_tr", "seo_title_en", "seo_description_tr", "seo_description_en",
    "seo_keywords_tr", "seo_keywords_en", "canonical_url", "og_image",
    "published", "featured", "sort_order", "published_at",
] as const;

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: { category: true },
        });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        const body = await req.json();

        if (body.slug !== undefined && !slugRegex().test(body.slug)) {
            return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
        }

        const techStr = body.technologies;
        const technologies = typeof techStr === "string" ? techStr : Array.isArray(techStr) ? JSON.stringify(techStr) : body.technologies;

        const updateData: Record<string, unknown> = {};
        const allowed = new Set(PROJECT_UPDATE_FIELDS);

        const pairs: [string, unknown][] = [
            ["slug", body.slug?.trim()],
            ["title_tr", body.title_tr?.trim()],
            ["title_en", body.title_en?.trim()],
            ["excerpt_tr", body.excerpt_tr?.trim()],
            ["excerpt_en", body.excerpt_en?.trim()],
            ["content_tr", body.content_tr?.trim()],
            ["content_en", body.content_en?.trim()],
            ["category_id", toNull(body.category_id)],
            ["sector", toNull(body.sector)],
            ["service_type", toNull(body.service_type)],
            ["technologies", technologies],
            ["client_name", body.is_anonymous_client ? null : toNull(body.client_name)],
            ["is_anonymous_client", body.is_anonymous_client],
            ["project_date", toDateOrNull(body.project_date)],
            ["cover_image", toNull(body.cover_image)],
            ["cover_image_alt_tr", toNull(body.cover_image_alt_tr)],
            ["cover_image_alt_en", toNull(body.cover_image_alt_en)],
            ["cover_image_title_tr", toNull(body.cover_image_title_tr)],
            ["cover_image_title_en", toNull(body.cover_image_title_en)],
            ["cover_image_caption_tr", toNull(body.cover_image_caption_tr)],
            ["cover_image_caption_en", toNull(body.cover_image_caption_en)],
            ["problem_tr", toNull(body.problem_tr)],
            ["problem_en", toNull(body.problem_en)],
            ["solution_tr", toNull(body.solution_tr)],
            ["solution_en", toNull(body.solution_en)],
            ["process_tr", toNull(body.process_tr)],
            ["process_en", toNull(body.process_en)],
            ["result_tr", toNull(body.result_tr)],
            ["result_en", toNull(body.result_en)],
            ["metric_label_1_tr", toNull(body.metric_label_1_tr)],
            ["metric_label_1_en", toNull(body.metric_label_1_en)],
            ["metric_value_1", toNull(body.metric_value_1)],
            ["metric_label_2_tr", toNull(body.metric_label_2_tr)],
            ["metric_label_2_en", toNull(body.metric_label_2_en)],
            ["metric_value_2", toNull(body.metric_value_2)],
            ["metric_label_3_tr", toNull(body.metric_label_3_tr)],
            ["metric_label_3_en", toNull(body.metric_label_3_en)],
            ["metric_value_3", toNull(body.metric_value_3)],
            ["live_url", toNull(body.live_url)],
            ["demo_url", toNull(body.demo_url)],
            ["github_url", toNull(body.github_url)],
            ["seo_title_tr", toNull(body.seo_title_tr)],
            ["seo_title_en", toNull(body.seo_title_en)],
            ["seo_description_tr", toNull(body.seo_description_tr)],
            ["seo_description_en", toNull(body.seo_description_en)],
            ["seo_keywords_tr", toNull(body.seo_keywords_tr)],
            ["seo_keywords_en", toNull(body.seo_keywords_en)],
            ["canonical_url", toNull(body.canonical_url)],
            ["og_image", toNull(body.og_image)],
            ["published", body.status === "published"],
            ["featured", body.featured],
            ["sort_order", toIntOrNull(body.sort_order)],
            ["published_at", body.status === "published" ? (toDateOrNull(body.published_at) || new Date()) : body.published_at],
        ];

        for (const [k, v] of pairs) {
            if (allowed.has(k as any) && v !== undefined) {
                updateData[k] = v;
            }
        }

        const project = await prisma.project.update({
            where: { id: params.id },
            data: updateData as any,
            include: { category: true },
        });
        return NextResponse.json(project);
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err?.code === "P2002") return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
        if (err?.code === "P2025") return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
        return NextResponse.json({ error: err?.message || "Güncelleme başarısız." }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        const body = await req.json();

        const updateData: Record<string, unknown> = {};
        if (typeof body.published === "boolean") {
            updateData.published = body.published;
            if (body.published) {
                const existing = await prisma.project.findUnique({ where: { id: params.id }, select: { published_at: true } });
                if (!existing?.published_at) updateData.published_at = new Date();
            }
        }
        if (typeof body.featured === "boolean") updateData.featured = body.featured;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Geçersiz güncelleme." }, { status: 400 });
        }

        const project = await prisma.project.update({
            where: { id: params.id },
            data: updateData,
            include: { category: true },
        });
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const params = await props.params;
        await prisma.project.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
