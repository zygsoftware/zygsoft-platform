import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "admin";
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const sourceId = body.sourceId?.trim();
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId gerekli" }, { status: 400 });
    }

    const source = await prisma.blogPost.findUnique({
      where: { id: sourceId },
      include: { tags: true },
    });
    if (!source) {
      return NextResponse.json({ error: "Kaynak yazı bulunamadı" }, { status: 404 });
    }

    let newSlug = `${source.slug}-kopya`;
    let suffix = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${source.slug}-kopya-${suffix}`;
      suffix++;
    }

    const post = await prisma.blogPost.create({
      data: {
        slug: newSlug,
        title_tr: source.title_tr,
        title_en: source.title_en,
        excerpt_tr: source.excerpt_tr,
        excerpt_en: source.excerpt_en,
        content_tr: source.content_tr,
        content_en: source.content_en,
        cover_image: source.cover_image,
        og_image: source.og_image,
        seo_title_tr: source.seo_title_tr,
        seo_title_en: source.seo_title_en,
        seo_description_tr: source.seo_description_tr,
        seo_description_en: source.seo_description_en,
        seo_keywords_tr: source.seo_keywords_tr,
        seo_keywords_en: source.seo_keywords_en,
        canonical_url: source.canonical_url,
        category_id: source.category_id,
        is_featured: false,
        published: false,
        published_at: null,
        allow_comments: source.allow_comments,
        view_count: 0,
        author: source.author,
        reading_time_min: source.reading_time_min,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    if (source.tags.length > 0) {
      await prisma.blogPostTag.createMany({
        data: source.tags.map((t) => ({ post_id: post.id, tag_id: t.tag_id })),
      });
    }

    const updated = await prisma.blogPost.findUnique({
      where: { id: post.id },
      include: { category: true, tags: { include: { tag: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[blog/duplicate] ERROR:", error);
    return NextResponse.json({ error: "Kopyalama başarısız" }, { status: 500 });
  }
}
