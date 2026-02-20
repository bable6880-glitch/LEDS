import { z } from "zod";

// ─── Review Validation ──────────────────────────────────────────────────────

export const createReviewSchema = z.object({
    kitchenId: z.string().uuid("Invalid kitchen ID"),
    rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
    comment: z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .max(2000, "Comment must be at most 2000 characters")
        .trim()
        .optional(),
});

export const reviewQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    sort: z.enum(["newest", "oldest", "highest", "lowest"]).default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
