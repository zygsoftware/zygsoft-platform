/**
 * Lightweight in-memory IP-based rate limiter.
 *
 * ⚠️  SINGLE-INSTANCE ONLY
 * State is stored in module-level Maps and is therefore local to one Node.js
 * process. On multi-instance / serverless deployments (Vercel, AWS Lambda,
 * multiple PM2 workers) each instance maintains its own counters, so a client
 * can exceed the logical limit by cycling through instances.
 *
 * For production multi-instance deployments, replace the storage layer with a
 * shared store such as Redis (e.g. via `@upstash/ratelimit`).
 * The public interface of this module is designed so that swap-out is minimal.
 */

/* ── Types ──────────────────────────────────────────────────────── */

interface WindowEntry {
    count:       number;
    windowStart: number;
}

export interface RateLimitOptions {
    /** Length of the sliding window in milliseconds. */
    windowMs: number;
    /** Maximum number of requests allowed within the window. */
    max:      number;
}

export interface RateLimitResult {
    /** True when the client has exceeded the limit. */
    limited:   boolean;
    /** How many requests remain in the current window (0 when limited). */
    remaining: number;
    /** Seconds until the current window resets. */
    resetInSeconds: number;
}

/* ── Storage ────────────────────────────────────────────────────── */

// Namespaced stores: one Map<ip, WindowEntry> per route namespace.
const stores = new Map<string, Map<string, WindowEntry>>();

function getStore(namespace: string): Map<string, WindowEntry> {
    if (!stores.has(namespace)) {
        stores.set(namespace, new Map());
    }
    return stores.get(namespace)!;
}

/* ── Periodic cleanup ────────────────────────────────────────────
   Prevents unbounded memory growth by removing entries that have not been
   touched for longer than the maximum window we expect to use (2 hours).      */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;  // every 5 minutes
const MAX_ENTRY_AGE_MS    = 2 * 60 * 60 * 1000; // 2 hours

let cleanupScheduled = false;

function scheduleCleanup(): void {
    if (cleanupScheduled) return;
    cleanupScheduled = true;

    const timer = setInterval(() => {
        const now = Date.now();
        for (const store of stores.values()) {
            for (const [key, entry] of store.entries()) {
                if (now - entry.windowStart > MAX_ENTRY_AGE_MS) {
                    store.delete(key);
                }
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Allow the process to exit cleanly even if this timer is pending.
    if (typeof timer === "object" && "unref" in timer) {
        (timer as ReturnType<typeof setInterval> & { unref(): void }).unref();
    }
}

/* ── IP extraction ───────────────────────────────────────────────── */

function getClientIp(request: Request): string {
    const headers = request.headers;

    // Standard header set by Nginx / Cloudflare / most reverse proxies.
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    // CF-Connecting-IP (Cloudflare)
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    // Local development fallback.
    return "127.0.0.1";
}

/* ── Public API ──────────────────────────────────────────────────── */

/**
 * Check whether a request from the detected IP is within the rate limit.
 *
 * @param request   The incoming Next.js Request object.
 * @param namespace A unique string key per route (e.g. "contact").
 * @param options   Window and max-request settings.
 *
 * @example
 * const rl = rateLimit(request, "contact", { windowMs: 10 * 60_000, max: 5 });
 * if (rl.limited) {
 *   return NextResponse.json({ error: "Çok fazla istek." }, { status: 429 });
 * }
 */
export function rateLimit(
    request:   Request,
    namespace: string,
    options:   RateLimitOptions,
): RateLimitResult {
    scheduleCleanup();

    const ip    = getClientIp(request);
    const store = getStore(namespace);
    const now   = Date.now();
    const entry = store.get(ip);

    // First request, or window has expired → start a fresh window.
    if (!entry || now - entry.windowStart > options.windowMs) {
        store.set(ip, { count: 1, windowStart: now });
        return {
            limited:        false,
            remaining:      options.max - 1,
            resetInSeconds: Math.ceil(options.windowMs / 1000),
        };
    }

    // Window is active and limit already reached.
    if (entry.count >= options.max) {
        const resetInSeconds = Math.ceil(
            (options.windowMs - (now - entry.windowStart)) / 1000
        );
        return { limited: true, remaining: 0, resetInSeconds };
    }

    // Window is active, still has capacity.
    entry.count++;
    return {
        limited:        false,
        remaining:      options.max - entry.count,
        resetInSeconds: Math.ceil((options.windowMs - (now - entry.windowStart)) / 1000),
    };
}

/* ── Pre-configured limiters (convenience wrappers) ─────────────── */

/**
 * 5 requests per 10 minutes — for the public contact form.
 * Strict enough to deter campaigns while allowing a persistent user to retry.
 */
export function contactRateLimit(request: Request): RateLimitResult {
    return rateLimit(request, "contact", { windowMs: 10 * 60_000, max: 5 });
}

/**
 * 3 requests per 60 minutes — for customer registration.
 * Tight to prevent account-farming bots.
 */
export function registerRateLimit(request: Request): RateLimitResult {
    return rateLimit(request, "register", { windowMs: 60 * 60_000, max: 3 });
}

/**
 * 10 requests per 60 minutes — for authenticated support ticket creation.
 * More lenient because the route already requires a valid session.
 */
export function supportRateLimit(request: Request): RateLimitResult {
    return rateLimit(request, "support", { windowMs: 60 * 60_000, max: 10 });
}
