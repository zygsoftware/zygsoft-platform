import { NextResponse } from "next/server";

const FIELDS = "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url";
const LIMIT = 6;
const REVALIDATE = 1800; // 30 minutes

// Exact URL that works in curl (no version in path)
const INSTAGRAM_MEDIA_URL = "https://graph.instagram.com/me/media";

const isDev = process.env.NODE_ENV === "development";

export type InstagramPost = {
  id: string;
  caption: string | null;
  imageUrl: string;
  permalink: string;
  mediaType: string;
  timestamp: string;
};

type InstagramMediaNode = {
  id: string;
  caption?: string | null;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  thumbnail_url?: string | null;
};

type InstagramMediaResponse = {
  data?: InstagramMediaNode[];
  error?: { message: string; code?: number; type?: string };
};

function pickImageUrl(node: InstagramMediaNode): string {
  const type = (node.media_type ?? "IMAGE").toUpperCase();

  if (type === "VIDEO" || type === "REELS") {
    if (node.thumbnail_url?.trim()) return node.thumbnail_url;
    if (node.media_url?.trim()) return node.media_url;
    return "";
  }
  if (type === "CAROUSEL_ALBUM") {
    if (node.media_url?.trim()) return node.media_url;
    if (node.thumbnail_url?.trim()) return node.thumbnail_url;
    return "";
  }
  // IMAGE (default)
  if (node.media_url?.trim()) return node.media_url;
  if (node.thumbnail_url?.trim()) return node.thumbnail_url;
  return "";
}

function normalizePost(node: InstagramMediaNode): InstagramPost {
  const imageUrl = pickImageUrl(node);
  const permalink = node.permalink?.trim() || `https://www.instagram.com/p/${node.id}`;

  return {
    id: node.id,
    caption: node.caption ?? null,
    imageUrl,
    permalink,
    mediaType: node.media_type ?? "IMAGE",
    timestamp: node.timestamp ?? "",
  };
}

function errorResponse(
  message: string,
  status?: number,
  raw?: unknown
): NextResponse {
  const body: Record<string, unknown> = {
    success: false,
    message,
    posts: [],
  };
  if (status != null) body.status = status;
  if (isDev && raw != null) body.raw = raw;

  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const hasToken = !!(token?.trim());

  if (isDev) {
    console.log("[Instagram API] token present:", hasToken);
  }

  if (!hasToken) {
    return errorResponse(
      "INSTAGRAM_ACCESS_TOKEN is not set. Add it to .env and restart the dev server."
    );
  }

  try {
    const url = new URL(INSTAGRAM_MEDIA_URL);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("limit", String(LIMIT));
    url.searchParams.set("access_token", token!);

    const requestUrl = `${url.origin}${url.pathname}?fields=${FIELDS}&limit=${LIMIT}&access_token=***`;
    if (isDev) {
      console.log("[Instagram API] request URL (token hidden):", requestUrl);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });

    const data: InstagramMediaResponse = await res.json();

    if (isDev) {
      console.log("[Instagram API] response status:", res.status);
      console.log("[Instagram API] raw response:", JSON.stringify(data, null, 2));
    }

    if (!res.ok) {
      const msg = data.error?.message ?? res.statusText ?? "Instagram API error";
      if (isDev) {
        console.error("[Instagram API] error:", msg, data.error);
      }
      return errorResponse(msg, res.status, data.error);
    }

    const nodes = data.data ?? [];
    const normalized = nodes.map(normalizePost);

    // Only drop if BOTH imageUrl and permalink are missing
    const posts = normalized.filter((p) => p.imageUrl?.trim() || p.permalink?.trim());

    if (isDev) {
      console.log("[Instagram API] normalized posts:", JSON.stringify(posts, null, 2));
    }

    return NextResponse.json(
      { success: true, posts },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (isDev) {
      console.error("[Instagram API] fetch error:", err);
    }
    return errorResponse(`Fetch failed: ${msg}`, undefined, isDev ? { error: String(err) } : undefined);
  }
}
