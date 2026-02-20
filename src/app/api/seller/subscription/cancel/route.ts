import { NextRequest } from "next/server";
import { requireSeller } from "@/lib/auth/seller-guard";
import { cancelSubscription } from "@/services/premium.service";
import { cancelSubscriptionSchema } from "@/lib/validations/subscription";
import {
    apiSuccess,
    apiBadRequest,
    apiInternalError,
} from "@/lib/utils/api-response";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/seller/subscription/cancel
 * Auth required (COOK): Cancel auto-renewal on current subscription.
 */
export async function POST(request: NextRequest) {
    try {
        const guard = await requireSeller(request);
        if (!guard.ok) return guard.response;
        const { user } = guard;

        const body = await request.json();
        const parsed = cancelSubscriptionSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<
                string,
                string[]
            >;
            return apiBadRequest("Invalid cancellation data", errors);
        }

        const result = await cancelSubscription(
            parsed.data.subscriptionId,
            user.id,
            parsed.data.reason
        );

        return apiSuccess(result);
    } catch (error) {
        if (error instanceof AppError) {
            return apiBadRequest(error.message);
        }
        logger.error("Subscription cancellation failed", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return apiInternalError("Failed to cancel subscription");
    }
}
