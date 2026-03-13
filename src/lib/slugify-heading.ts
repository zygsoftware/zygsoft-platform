/**
 * Generates a stable, URL-safe slug from heading text.
 * Supports Turkish characters: ç, ğ, ı, İ, ö, ş, ü
 */
export function slugifyHeading(text: string): string {
    if (!text || typeof text !== "string") return "";
    const trMap: Record<string, string> = {
        ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", I: "i",
        ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
    };
    let s = text.trim();
    for (const [from, to] of Object.entries(trMap)) {
        s = s.replace(new RegExp(from, "g"), to);
    }
    s = s
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return s || "section";
}
