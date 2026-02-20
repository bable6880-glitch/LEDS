// ─── App-wide Constants ─────────────────────────────────────────────────────

export const APP_NAME = "Smart Tiffin";
export const APP_DESCRIPTION = "Discover home-cooked food from kitchens near you";

// ─── Pagination ─────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// ─── Rate Limits ────────────────────────────────────────────────────────────
export const RATE_LIMITS = {
    PUBLIC: { requests: 60, window: "1m" as const },
    AUTH: { requests: 10, window: "1m" as const },
    WRITE: { requests: 20, window: "1m" as const },
    UPLOAD: { requests: 10, window: "5m" as const },
} as const;

// ─── Roles ──────────────────────────────────────────────────────────────────
export const ROLES = {
    CUSTOMER: "CUSTOMER",
    COOK: "COOK",
    ADMIN: "ADMIN",
} as const;

// ─── Request Size Limits ────────────────────────────────────────────────────
export const MAX_BODY_SIZE = 1_048_576; // 1MB

// ─── Slugify Helper ─────────────────────────────────────────────────────────
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

// ─── Sanitize String ────────────────────────────────────────────────────────
export function sanitizeString(str: string): string {
    return str
        .replace(/<[^>]*>/g, "") // strip HTML tags
        .replace(/&[^;]+;/g, "") // strip HTML entities
        .trim();
}
