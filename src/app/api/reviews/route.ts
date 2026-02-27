import { NextRequest } from "next/server";
import { createReviewSchema } from "@/lib/validations/review";
import { createReview, addSellerReply } from "@/services/review.service";
import {
    apiCreated,
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiConflict,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { AppError } from "@/lib/utils/errors";
import { z } from "zod";

/**
 * POST /api/reviews
 * Auth required (CUSTOMER): Submit a review for a kitchen.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = createReviewSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid review data", errors);
        }

        const review = await createReview(user.id, parsed.data);
        return apiCreated(review);
    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 409) return apiConflict(error.message);
            return apiBadRequest(error.message);
        }
        console.error("[Create Review Error]", error);
        return apiInternalError("Failed to submit review");
    }
}

// ─── Seller Reply Schema ────────────────────────────────────────────────────

const sellerReplySchema = z.object({
    reviewId: z.string().uuid("Invalid review ID"),
    reply: z.string().min(1, "Reply cannot be empty").max(1000, "Reply too long"),
});

/**
 * PATCH /api/reviews
 * Auth required (COOK): Reply to a review on your kitchen.
 */
export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = sellerReplySchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid reply data", errors);
        }

        const updated = await addSellerReply(parsed.data.reviewId, user.id, parsed.data.reply);
        return apiSuccess(updated);
    } catch (error) {
        if (error instanceof AppError) {
            return apiBadRequest(error.message);
        }
        console.error("[Seller Reply Error]", error);
        return apiInternalError("Failed to submit reply");
    }
}

