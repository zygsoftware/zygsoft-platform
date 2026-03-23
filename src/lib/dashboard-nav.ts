/**
 * Dashboard sidebar active state uses internal segments (folder names),
 * because next-intl rewrites localized URLs to the app directory structure.
 */
export function isDashboardSidebarActive(internalHref: string, segments: string[]): boolean {
    const parts = internalHref.replace(/^\//, "").split("/").filter(Boolean);
    if (parts[0] !== "dashboard") return false;
    const rest = parts.slice(1);

    if (rest.length === 0) {
        return segments.length === 0;
    }

    if (rest[0] === "tools" && rest.length === 1) {
        return segments[0] === "tools";
    }

    if (rest.length > segments.length) return false;
    return rest.every((seg, i) => seg === segments[i]);
}
