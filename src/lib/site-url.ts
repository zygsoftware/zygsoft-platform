function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  const protocol = trimmed.includes("localhost") || trimmed.startsWith("127.0.0.1")
    ? "http://"
    : "https://";

  return `${protocol}${trimmed}`.replace(/\/+$/, "");
}

function isLocalhostUrl(value: string): boolean {
  return /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeBaseUrl)
    .filter(Boolean);

  const explicitNonLocalhost = candidates.find((candidate) => !isLocalhostUrl(candidate));
  if (explicitNonLocalhost) {
    return explicitNonLocalhost;
  }

  const firstCandidate = candidates[0];
  if (firstCandidate) {
    return firstCandidate;
  }

  return "http://localhost:3000";
}

