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

const PROJECT_CREATE_FIELDS = [
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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all") === "true";
        const category = searchParams.get("category");
        const sector = searchParams.get("sector");
        const featured = searchParams.get("featured") === "true";
        const search = searchParams.get("search");
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
        const sort = searchParams.get("sort") || "newest";

        const where: Record<string, unknown> = {};
        if (!all) where.published = true;
        if (category) where.category_id = category;
        if (sector) where.sector = sector;
        if (featured) where.featured = true;
        if (search?.trim()) {
            where.OR = [
                { title_tr: { contains: search } },
                { title_en: { contains: search } },
                { excerpt_tr: { contains: search } },
                { excerpt_en: { contains: search } },
            ];
        }

        const orderBy: Record<string, string>[] =
            sort === "updated"
                ? [{ updated_at: "desc" }]
                : sort === "sort_order"
                    ? [{ sort_order: "asc" }, { published_at: "desc" }]
                    : [{ published_at: "desc" }, { created_at: "desc" }];

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                include: { category: true },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.project.count({ where }),
        ]);

        return NextResponse.json({
            projects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Projects fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
        }
        const body = await req.json();

        const slug = body.slug?.trim() || body.title_tr?.trim()
            ?.toLowerCase()
            .replace(/[^a-z0-9ğüşıöç\s-]/gi, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c") || "";

        if (!slug || !slugRegex().test(slug)) {
            return NextResponse.json({ error: "Geçersiz slug. Yalnızca küçük harf, rakam ve tire kullanın." }, { status: 400 });
        }
        if (!body.title_tr?.trim() || !body.title_en?.trim()) {
            return NextResponse.json({ error: "Başlık (TR ve EN) zorunludur." }, { status: 400 });
        }
        if (!body.excerpt_tr?.trim() || !body.excerpt_en?.trim()) {
            return NextResponse.json({ error: "Özet (TR ve EN) zorunludur." }, { status: 400 });
        }
        if (!body.content_tr?.trim() || !body.content_en?.trim()) {
            return NextResponse.json({ error: "İçerik (TR ve EN) zorunludur." }, { status: 400 });
        }

        const techStr = body.technologies;
        const technologies = typeof techStr === "string" ? techStr : Array.isArray(techStr) ? JSON.stringify(techStr) : null;

        const data: Record<string, unknown> = {
            slug,
            title_tr: body.title_tr.trim(),
            title_en: body.title_en.trim(),
            excerpt_tr: body.excerpt_tr.trim(),
            excerpt_en: body.excerpt_en.trim(),
            content_tr: body.content_tr.trim(),
            content_en: body.content_en.trim(),
            category_id: toNull(body.category_id),
            sector: toNull(body.sector),
            service_type: toNull(body.service_type),
            technologies,
            client_name: body.is_anonymous_client ? null : toNull(body.client_name),
            is_anonymous_client: !!body.is_anonymous_client,
            project_date: toDateOrNull(body.project_date),
            cover_image: toNull(body.cover_image),
            cover_image_alt_tr: toNull(body.cover_image_alt_tr),
            cover_image_alt_en: toNull(body.cover_image_alt_en),
            cover_image_title_tr: toNull(body.cover_image_title_tr),
            cover_image_title_en: toNull(body.cover_image_title_en),
            cover_image_caption_tr: toNull(body.cover_image_caption_tr),
            cover_image_caption_en: toNull(body.cover_image_caption_en),
            problem_tr: toNull(body.problem_tr),
            problem_en: toNull(body.problem_en),
            solution_tr: toNull(body.solution_tr),
            solution_en: toNull(body.solution_en),
            process_tr: toNull(body.process_tr),
            process_en: toNull(body.process_en),
            result_tr: toNull(body.result_tr),
            result_en: toNull(body.result_en),
            metric_label_1_tr: toNull(body.metric_label_1_tr),
            metric_label_1_en: toNull(body.metric_label_1_en),
            metric_value_1: toNull(body.metric_value_1),
            metric_label_2_tr: toNull(body.metric_label_2_tr),
            metric_label_2_en: toNull(body.metric_label_2_en),
            metric_value_2: toNull(body.metric_value_2),
            metric_label_3_tr: toNull(body.metric_label_3_tr),
            metric_label_3_en: toNull(body.metric_label_3_en),
            metric_value_3: toNull(body.metric_value_3),
            live_url: toNull(body.live_url),
            demo_url: toNull(body.demo_url),
            github_url: toNull(body.github_url),
            seo_title_tr: toNull(body.seo_title_tr),
            seo_title_en: toNull(body.seo_title_en),
            seo_description_tr: toNull(body.seo_description_tr),
            seo_description_en: toNull(body.seo_description_en),
            seo_keywords_tr: toNull(body.seo_keywords_tr),
            seo_keywords_en: toNull(body.seo_keywords_en),
            canonical_url: toNull(body.canonical_url),
            og_image: toNull(body.og_image),
            published: body.status === "published" || !!body.published,
            featured: !!body.featured,
            sort_order: toIntOrNull(body.sort_order),
            published_at: body.status === "published" ? (toDateOrNull(body.published_at) || new Date()) : null,
        };

        const project = await prisma.project.create({
            data: data as any,
            include: { category: true },
        });
        return NextResponse.json(project);
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err?.code === "P2002") {
            return NextResponse.json({ error: "Bu slug zaten kullanımda." }, { status: 409 });
        }
        console.error("Project create error:", error);
        return NextResponse.json({ error: err?.message || "Proje oluşturulamadı." }, { status: 500 });
    }
}
