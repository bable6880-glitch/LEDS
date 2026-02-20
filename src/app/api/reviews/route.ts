import { NextRequest } from "next/server";
import { createReviewSchema } from "@/lib/validations/review";
import { createReview } from "@/services/review.service";
import {
    apiCreated,
    apiBadRequest,
    apiUnauthorized,
    apiConflict,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { AppError } from "@/lib/utils/errors";

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
